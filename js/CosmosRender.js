var CosmosRender = function (cosmosScene, cosmosUI) {
    var _this = this;
    var jed = toJED(new Date());    // julian date
    var jed_delta = 3;  // how many days per second to elapse
    var using_webgl = true;
    var camera, farCamera;
    var CAMERA_NEAR = 10;
    var CAMERA_FAR = 1000000;
    var FOCAL_LENGTH = 60;
    var clock = new THREE.Clock();
    var controls = undefined;

    var renderer = new THREE.WebGLRenderer({ antialias: false });
    var canvas, jCanvas, composer;
    var cameraTarget;
    var bokehPass;
    var OBJECT_BLUR = {LARGE: 20, MEDIUM: 10, SMALL: 2 };

    this.init = function () {
        clock.start();

        canvas = document.getElementById('canvas');
        jCanvas = $('#canvas');

        initCamera();
        initRenderer();
    };

    this.isUsingWebGL = function () {return using_webgl;};

    this.getMaxCullDist = function () {return CAMERA_FAR;};
    
    this.getRenderer = function () {return renderer;};

    this.getClock = function () {return clock;};

    this.setJED = function (newJed) {jed = newJed;};
    this.getJED = function () {return jed;};

    // Needs to be a scene object, not a mesh
    this.clearCameraTarget = function () {cameraTarget = undefined;};

    this.animate = function () {
        requestAnimationFrame(_this.animate, undefined);

        update(clock.getDelta());
        cosmosUI.update();
        _this.orbitCamera();

        render();

    };

    this.enableControls = function () {controls.enable = true;};
    this.disableControls = function () {controls.enable = false;};

    this.orbitCamera = function (originObj) {
        var position = new THREE.Vector3();
        if (originObj == undefined && cameraTarget != undefined) {
            // Called from animate() to update every frame to keep origin position
            if (cameraTarget.parent && cameraTarget.parent.model && cameraTarget.parent.model == 'Sun') {
                controls.target = cosmosScene.getWorldPos(cameraTarget.mesh);
            }
            else if (cameraTarget.parent.parent) {
                if (cameraTarget.parent.parent.parent) {
                    controls.target = cosmosScene.getWorldPos(cameraTarget.mesh.parent.parent);
                }
                controls.target = cosmosScene.getWorldPos(cameraTarget.mesh.parent);
            }
            else {
                controls.target = cosmosScene.getWorldPos(cameraTarget.mesh);
            }
        }
        else if (originObj != undefined) {
            cameraTarget = originObj;
            // adjust focus to parent if it has one
            if (cameraTarget.parent && cameraTarget.parent.model && cameraTarget.parent.model == 'Sun') {
                controls.target = cosmosScene.getWorldPos(originObj.mesh);
            }
            else if (cameraTarget.parent.parent) {
                if (cameraTarget.parent.parent.parent) {
                    controls.target = cosmosScene.getWorldPos(cameraTarget.mesh.parent.parent);
                }
                controls.target = cosmosScene.getWorldPos(originObj.mesh.parent);
            }
            else {
                controls.target = cosmosScene.getWorldPos(originObj.mesh);
            }

        }

        // ensure origin target keeps ellipse displayed
        if (cameraTarget && cameraTarget.orbit) cameraTarget.orbit.getEllipse().visible = true;

        controls.update();
        farCamera.position.copy(camera.position);
        farCamera.rotation.copy(camera.rotation);

        if (bokehPass && cameraTarget) {
            bokehPass.enabled = true;
            var dist = Math.abs(cosmosScene.getWorldPos(cameraTarget.mesh).distanceTo(camera.position));

            // find radius for object while accounting for some meshes being actually LOD objects
            var radius;
            if (cameraTarget.type == 'asteroid') {
                // multiplying by three to account for perlin noise
                radius = cameraTarget.mesh.getObjectForDistance(dist).geometry.boundingSphere.radius * 3;
            }
            else if (cameraTarget.mesh.userData && cameraTarget.mesh.userData.boundingBox) {
                radius = cameraTarget.mesh.userData.boundingBox.getBoundingSphere().radius;
            }
            else {radius = cameraTarget.mesh.geometry.boundingSphere.radius}

            var cullDist = dist + radius * 0.60;

            // adjust bokeh culling to be past target object
            if (cullDist < 400) {
                CAMERA_NEAR = cullDist;
                camera.far = cullDist;
                farCamera.near = cullDist;
                camera.updateProjectionMatrix();
                farCamera.updateProjectionMatrix();
            }

            // adjust distance for bokeh shader to accompany blurring difference sized objects
            if (radius >= OBJECT_BLUR.LARGE) { dist -= radius / 2; }
            else if (radius >= OBJECT_BLUR.MEDIUM) { dist += radius * 1.5; }
            else if (radius >= OBJECT_BLUR.SMALL) { dist += radius * 5; }
            else { dist += radius * 10; }

            // Distance check to remove aberrations from the bokeh shader
            if (dist >= 400) dist = 400;
            bokehPass.materialBokeh.uniforms.focalDepth.value = dist;
        }
        else if (bokehPass && cameraTarget == undefined) bokehPass.enabled = false;
    };

    this.getCamera = function (isFar) {
        if (isFar) return farCamera;
        return camera;
    };

    this.onWindowResize = function () {
        camera = $(canvas).width() / $(canvas).height();
        farCamera.aspect = $(canvas).width() / $(canvas).height();
        camera.updateProjectionMatrix();
        farCamera.updateProjectionMatrix();

        renderer.setSize($(canvas).width(), $(canvas).height());

        render();
    };

    function render() {
        composer.render(0.1);
    }

    function initCamera() {
        camera = new THREE.PerspectiveCamera( FOCAL_LENGTH, $(canvas).width() / $(canvas).height(), 1, CAMERA_NEAR );
        farCamera = new THREE.PerspectiveCamera( FOCAL_LENGTH, $(canvas).width() / $(canvas).height(),
                CAMERA_NEAR - 1, CAMERA_FAR );
        camera.position.z = 500;
        farCamera.position = camera.position.clone();
        farCamera.rotation = camera.rotation.clone();
    }

    function initRenderer() {

        renderer.autoClear = false;

        composer = new THREE.EffectComposer(renderer);

        var farPass = new THREE.RenderPass(cosmosScene.getScene(), farCamera);
        composer.addPass(farPass);

        var copyPass = new THREE.ShaderPass(THREE.CopyShader);
        copyPass.renderToScreen = false;
        composer.addPass(copyPass);

        bokehPass = new THREE.Bokeh2Pass(cosmosScene.getScene(), farCamera, {
            shaderFocus: {type: 'i', value: 0},
            focusCoords: {type: 'v2', value: new THREE.Vector2(0.5, 0.5)},
            znear: {type: 'f', value: parseFloat(CAMERA_NEAR)},
            zfar: {type: 'f', value: parseFloat(CAMERA_FAR)},

            fstop: {type: 'f', value: parseFloat(CAMERA_NEAR) / 10.0},
            maxblur: {type: 'f', value: 0.04},

            showFocus: {type: 'i', value: 0},
            manualdof: {type: 'i', value: 0},
            vignetting: {type: 'i', value: 1},
            depthblur: {type: 'i', value: 1},

            threshold: {type: 'f', value: 0.5},
            gain: {type: 'f', value: 5.2},
            bias: {type: 'f', value: 1.0},
            fringe: {type: 'f', value: 0.002},

            focalLength: {type: 'f', value: parseFloat(FOCAL_LENGTH)},
            noise: {type: 'i', value: 0},
            pentagon: {type: 'i', value: 0},
            samples: {type: 'i', value: 8},
            rings: {type: 'i', value: 1},
            dithering: {type: 'f', value: 0.0002}
        });

        bokehPass.renderToScreen = false;
        bokehPass.needsSwap = true;
        composer.addPass(bokehPass);

        copyPass.renderToScreen = false;
        composer.addPass(copyPass);

        var nearPass = new THREE.RenderPass(cosmosScene.getScene(), camera);
        nearPass.renderToScreen = false;
        nearPass.clear = false;
        nearPass.clearDepth = true;

        composer.addPass(nearPass);

        var finalPass = new THREE.ShaderPass(THREE.CopyShader);
        finalPass.renderToScreen = true;
        composer.addPass(finalPass);

        // adjust height for navbar and append
        var navbarHeight = $('#topNavbar').height();
        var hDiff = $(document.body).height() - navbarHeight - 1;
        var sidebarWidth = $('#left-sidebar').width();
        var wDiff = $(document.body).width();// - sidebarWidth;
        $('#canvas').append(renderer.domElement).css('width', wDiff).css('height', hDiff).css('top', navbarHeight);


        controls = new THREE.OrbitControls(camera, renderer.domElement);

        renderer.domElement.addEventListener('mousemove', cosmosUI.onDocumentMouseMove, false);
        renderer.domElement.addEventListener('mousedown', cosmosUI.onDocumentMouseDown, false);
        renderer.domElement.addEventListener('mouseup', cosmosUI.onDocumentMouseUp, false);
    }


    function update(deltaSeconds) {
        animateSun();
        // Update LODs based on distance
        cosmosScene.getScene().traverse(function (node) {
            if (node instanceof THREE.LOD) node.update(camera)
        });

        var timeAdvanced = jed_delta * deltaSeconds;
        jed += jed_delta * deltaSeconds;

        updateBodies(timeAdvanced, deltaSeconds, cosmosScene.getObjects());

        _this.orbitCamera();
    }

    function animateSun() {
        cosmosScene.getSolarCentricObject().mesh.material.uniforms['time'].value = _this.getClock().getElapsedTime();
    }

    function updateBodies(timeAdvanced, deltaSeconds, objects) {
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            var orbit = obj.orbit;

            //PLEASE HELP ME GET THIS CODE SECTION WORKING!
            //It should ping the web server, use generate_traj.py, and then this
            //section should be used to  actually animate the probe's trajectory
            //NOTE: The trajectory itself might not have as many frames as the
            //animation, so we might need to implement some type of interpolation
            if(obj.hasOwnProperty("trajplanned") && obj.time_launch.mjd == game.clock.mjd){
                //Let's use a websocket to get the trajectory from generate_traj.py
                //Actually, Game.py might call "import generate_traj" then run gen_traj
                var ObjTraj = ws.getTrajObj[obj.id];

                //The websocket should stream back a set of 3 arrays, t,x,y,z
                traj_t = ObjTraj[0]; //Traj Point Time
                traj_x = ObjTraj[1];
                traj_y = ObjTraj[2];
                traj_z = ObjTraj[3];
                if (traj_t == timeAdvanced){
                    mesh.position.set(traj_x,traj_y,traj_z);
                }
            }

            if (orbit != undefined && !obj.hasOwnProperty("dest")) {
                var helioCoords = orbit.getPosAtTime(jed);
                var mesh = obj.mesh;
                mesh.position.set(helioCoords[0], helioCoords[1], helioCoords[2]);


                /*
                 if (i != 2) {
                 var centerOfGravityPosition = meshes[2].position;

                 meshes[i].position.add(centerOfGravityPosition);
                 ellipses[i].position.copy(centerOfGravityPosition);
                 }
                 */

                if (orbit.eph && orbit.eph.rot_per) {
                    // we have an orbital period (in hours)
                    var rotationalPeriodInSeconds = orbit.eph.rot_per * 60 * 60;
                    var percentageRotated = timeAdvanced / rotationalPeriodInSeconds;
                    mesh.rotation.y += (percentageRotated * 2.0 * Math.PI);
                }
            }
            else if (obj.hasOwnProperty("dest")) {
                // move object to destination
                var arcLength = cosmosScene.getWorldPos(obj.mesh).distanceTo(cosmosScene.getWorldPos(obj.dest.mesh));
                var translateSpeed = (arcLength / obj.trajTime) * deltaSeconds;
                obj.trajTime -= deltaSeconds;
                obj.trajTime = obj.trajTime <= 0.01 ? 0.01 : obj.trajTime;
                obj.mesh.lookAt(cosmosScene.getWorldPos(obj.dest.mesh));
                obj.mesh.translateZ(translateSpeed);
                var sphereCollider = obj.dest.mesh.userData.boundingBox ?
                    obj.dest.mesh.userData.boundingBox.getBoundingSphere() : obj.dest.mesh.geometry.boundingSphere;
                var apoapsis = sphereCollider.radius * 2;

                if (arcLength <= apoapsis) {
                    // remove unneeded keys and create generic orbit
                    var eph = {
                        P: 10,
                        e: 0,
                        a: apoapsis * 0.003,
                        i: 0,
                        om: 0,
                        w: 0,
                        ma: 0,
                        epoch: _this.getJED()
                    };
                    obj.orbit = new Orbit3D(eph, {
                        color: 0xff0000,
                        display_color: 0xff0000,
                        width: 2,
                        object_size: 1 < 0 ? 50 : 15, //1.5,
                        jed: _this.getJED(),
                        particle_geometry: null, // will add itself to this geometry
                        name: obj.full_name
                    }, false);


                    if (obj.dest.type == 'playerObject' || sphereCollider.radius < 3) {
                        var dOrbit = obj.dest.orbit;
                        // change the orbit a little to show both objects
                        eph.P = dOrbit.eph.P;
                        eph.a = dOrbit.eph.a * 0.98;
                        eph.e = dOrbit.eph.e;
                        eph.i = dOrbit.eph.i;
                        eph.om = dOrbit.eph.om;
                        eph.w = dOrbit.eph.w;
                        eph.ma = dOrbit.eph.ma;
                        obj.orbit = new Orbit3D(eph, {
                            color: 0xff0000,
                            display_color: 0xff0000,
                            width: 2,
                            object_size: 1 < 0 ? 50 : 15, //1.5,
                            jed: _this.getJED(),
                            particle_geometry: null, // will add itself to this geometry
                            name: obj.full_name
                        }, false);
                        console.log("radius less than three");
                        cosmosScene.attachObject(obj, obj.dest.parent);
                    }
                    else {
                        cosmosScene.attachObject(obj, obj.dest.mesh);
                    }

                    delete obj.dest;
                    delete obj.trajTime;
                    delete obj.full_name;
                }
            }
        }
    }
};