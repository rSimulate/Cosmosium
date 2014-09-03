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
            CAMERA_NEAR = cullDist;
            camera.far = cullDist;
            farCamera.near = cullDist;
            camera.updateProjectionMatrix();
            farCamera.updateProjectionMatrix();

            // adjust distance for bokeh shader to accompany blurring difference sized objects
            dist -= radius;

            var maxblur = 0.006;

            // get a nice, gradual blur the closer you zoom
            var intensity = Math.pow(-(dist*0.00005) + maxblur, 1 + maxblur*4);

            if (isNaN(intensity)) {bokehPass.enabled = false;}
            else {
                // clamp value between zero and max blur intensity
                intensity = Math.min(Math.max(intensity, 0), maxblur);

                bokehPass.materialBokeh.uniforms.maxblur.value = intensity;
                bokehPass.materialBokeh.uniforms.focalDepth.value = dist;
            }
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
            znear: {type: 'f', value: 1.0},
            zfar: {type: 'f', value: parseFloat(CAMERA_FAR)},

            fstop: {type: 'f', value: 0.000001},
            maxblur: {type: 'f', value: 0.006},

            showFocus: {type: 'i', value: 0},
            manualdof: {type: 'i', value: 0},
            vignetting: {type: 'i', value: 0},
            depthblur: {type: 'i', value: 1},

            threshold: {type: 'f', value: 3.0},
            gain: {type: 'f', value: 10.2},
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

    function animateTraj(obj, deltaTime) {
        "use strict";

        var jd = _this.getJED();

        if (obj.hasOwnProperty('traj')) {
            var timeSegs = obj.traj[0];
            var xSegs = obj.traj[1];
            var ySegs = obj.traj[2];
            var zSegs = obj.traj[3];

            if (!obj.hasOwnProperty('trajLine')) {
                obj.trajNodes = [];
                var geometry = new THREE.Geometry();
                for (var i = 0; i < timeSegs.length; i++) {
                    // TODO: Change from normalized nodes to scene scale
                    var scale = 4;
                    var vector = new THREE.Vector4(xSegs[i] * scale, ySegs[i] * scale, zSegs[i] * scale, timeSegs[i] * scale);
                    geometry.vertices.push(vector);
                    obj.trajNodes.push(vector);
                }
                var material = new THREE.LineBasicMaterial({
                    color: 0xff00ff
                });
                obj.trajLine = new THREE.Line(geometry, material);
                obj.trajLine.position.copy(obj.position);
                cosmosScene.addTrajectory(obj.trajLine);
                console.log("trajline generated")
            }

            if (obj.hasOwnProperty('trajNodes')) {
                // bounding sphere of mesh to determine accurate distance to object
                var sphereCollider = obj.dest.mesh.userData.boundingBox ?
                    obj.dest.mesh.userData.boundingBox.getBoundingSphere() : obj.dest.mesh.geometry.boundingSphere;
                // distance from object to stop interpolating
                var apoapsis = sphereCollider.radius * 2;
                // nodes as a Vector4, with w being time in JD
                var nodes = obj.trajNodes;
                var curNode = nodes[0];

                // remove past node and calculate speed to next node
                if(curNode.w <= jd) {
                    nodes.shift();
                    curNode = nodes[0];

                    obj.timeToNode = (curNode.w/jed_delta) - (jd/jed_delta);
                    var arcLength = cosmosScene.getWorldPos(obj.mesh).distanceTo(cosmosScene.getWorldPos(obj.dest.mesh));
                    obj.speedToNode = arcLength/obj.timeToNode;

                }

                if (curNode == undefined) {
                    // Set up new orbit and remove traj keys through generateOrbit
                    cosmosScene.generateOrbit(obj, apoapsis, sphereCollider.radius);
                    // remove calculation keys
                    delete obj.timeToNode;
                    delete obj.speedToNode;
                }
                else {
                    var deltaSpeed = obj.speedToNode * deltaTime;
                    obj.mesh.lookAt(new THREE.Vector3(curNode.x, curNode.y, curNode.z));
                    obj.mesh.translateZ(deltaSpeed);
                }
            }
        }
    }

    function updateBodies(timeAdvanced, deltaSeconds, objects) {
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            var orbit = obj.orbit;

            // TODO: Cannot read property '0' of undefined
            if (obj.hasOwnProperty("dest") && obj.hasOwnProperty("traj") && obj.traj[0][0] <= _this.getJED() && obj.launched == false) {
                console.log(obj.traj[0][0]);
                cosmosScene.detachObject(obj);
                obj.launched = true;
            }

            if (orbit != undefined && obj.launched == false) {
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
            else if (obj.hasOwnProperty("dest") && obj.launched) {animateTraj(obj, deltaSeconds);}
        }
    }
};