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
        camera.aspect = $(canvas).width() / $(canvas).height();
        farCamera.aspect = $(canvas).width() / $(canvas).height();
        camera.updateProjectionMatrix();
        farCamera.updateProjectionMatrix();

        renderer.setSize($(canvas).width(), $(canvas).height());
        $('#UIApp').css('width', $(canvas).width()).css('height', $(canvas).height());

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

    function createTrajLine(obj) {
        "use strict";

        var timeSegs = obj.traj[0];
        var xSegs = obj.traj[1];
        var ySegs = obj.traj[2];
        var zSegs = obj.traj[3];

        var geometry = new THREE.Geometry();
        for (var i = 0; i < timeSegs.length; i++) {
            // Negative scale to play nice with pykep
            var scale = 288;
            var vector = new THREE.Vector3(xSegs[i] * scale, zSegs[i] * scale, ySegs[i] * scale);
            geometry.vertices.push(vector);
        }
        var material = new THREE.LineBasicMaterial({
            color: 0x00ff00
        });
        obj.trajLine = new THREE.Object3D();
        obj.trajLine.timeSegs = timeSegs;
        var line = new THREE.Line(geometry, material);
        var verts = line.geometry.vertices;
        line.position.set(-verts[0].x, -verts[0].y, -verts[0].z);
        obj.trajLine.add(line);

        var startCoords = obj.orbit.getPosAtTime(timeSegs[0]);
        obj.trajLine.position.set(startCoords[0], startCoords[1], startCoords[2]);
        obj.trajLine.updateMatrix();
        obj.trajLine.updateMatrixWorld(true);

        // line up traj the best we can to destination epoch
        var defaultTraj = obj.trajLine.clone();
        var solvedTraj = obj.trajLine.clone();
        var distCalc;
        var inc = 0.002;
        var pos = obj.dest.orbit.getPosAtTime(timeSegs[timeSegs.length - 1]);
        var posVec = new THREE.Vector3(pos[0], pos[1], pos[2]).applyMatrix4(cosmosScene.getScene().matrixWorld);

        var endNode = new THREE.Mesh( new THREE.SphereGeometry(SUN_SIZE / 12, 32, 32), new THREE.MeshBasicMaterial({color: 0x00ff00}));
        endNode.position.set(posVec.x, posVec.y, posVec.z);
        cosmosScene.getScene().add(endNode);

        for (var o = 2.0; o > 0.0; o -= inc) {

            obj.trajLine.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI * o);
            obj.trajLine.matrix.makeRotationFromEuler(obj.trajLine.rotation);
            obj.trajLine.updateMatrixWorld(true);
            line.matrixWorld.multiplyMatrices(obj.trajLine.matrixWorld, line.matrix);
            var point = verts[verts.length - 1].clone().applyMatrix4(line.matrixWorld);
            var dist = point.distanceTo(posVec.clone());

            if (distCalc == undefined) {distCalc = dist;}
            if (dist < distCalc) {
                distCalc = dist;
                solvedTraj = obj.trajLine.clone();
                obj.trajLine = defaultTraj.clone();

                if (dist < 40) {
                    inc = 0.001;
                }
                if (dist < 25) {
                    inc = 0.0007;
                }
                if (dist < 10) {
                    inc = 0.0005;
                }
                var trajDebug = false;
                if (trajDebug) {
                    var solverColor = new THREE.Color();
                    solverColor.setRGB(255 * o, 0, 1);

                    var solverLine = obj.trajLine.clone();
                    solverLine.children[0].material = new THREE.LineBasicMaterial({
                        color: solverColor.getHex()
                    });
                    cosmosScene.addTrajectory(solverLine);
                }
            }
            else {obj.trajLine = defaultTraj;}

            obj.trajLine.updateMatrix();
            obj.trajLine.updateMatrixWorld(true);
        }
        obj.trajLine = solvedTraj;
        obj.trajLine.timeSegs = timeSegs;
        obj.trajLine.endNode = endNode;
        //var verts = line.geometry.vertices;
        //var vec = posVec.clone().applyMatrix4(line.matrix);
        //verts[verts.length - 1].copy(vec);
        line.geometry.verticesNeedUpdate = true;

        cosmosScene.addTrajectory(obj.trajLine);

        console.log(obj.trajLine.timeSegs[obj.trajLine.timeSegs.length - 1]);
    }

    function animateTraj(obj, deltaTime) {
        "use strict";

        var jd = _this.getJED();

        if (obj.hasOwnProperty('traj')) {

            if (!obj.hasOwnProperty('trajLine') && obj.orbit != undefined) {
                // creates visual trajectory line and compiles trajNodes as an array of vector4s
                createTrajLine(obj);
            }

            if (obj.hasOwnProperty('trajLine')) {
                // bounding sphere of mesh to determine accurate distance to object
                var sphereCollider = obj.dest.mesh.userData.boundingBox ?
                    obj.dest.mesh.userData.boundingBox.getBoundingSphere() : obj.dest.mesh.geometry.boundingSphere;
                // distance from object to stop interpolating
                var apoapsis = sphereCollider.radius * 2;
                var line = obj.trajLine.children[0];
                // nodes as a Vector4, with w being time in JD
                var nodes = line.geometry.vertices;
                //var lastNode = nodes[0];
                var nextNode = nodes[1];
                var curEpoch = obj.trajLine.timeSegs[0];
                var nextEpoch = obj.trajLine.timeSegs[1];

                // remove past node and calculate speed to next node
                if(nextNode != undefined && curEpoch <= jd) {
                    nodes.shift();
                    obj.trajLine.timeSegs.shift();
                    line.geometry.verticesNeedUpdate = true;
                    line.geometry.buffersNeedUpdate = true;
                    line.updateMatrixWorld(true);
                    nextNode = nodes[1];

                    if (nextNode != undefined) {
                        var timeToNode = Math.abs((nextEpoch/jed_delta) - (jd/jed_delta));
                        var arcLength = cosmosScene.getWorldPos(obj.mesh).distanceTo(nextNode.clone().applyMatrix4(line.matrixWorld));
                        obj.trajLine.speedToNode = arcLength/timeToNode;
                    }
                    else {
                        if (nextNode) {nextNode = nextNode[0] == undefined ? undefined : nextNode[0];}
                    }
                }

                if (nextNode == undefined) {
                    // Set up new orbit and remove traj keys through generateOrbit
                    console.log(jd);
                    cosmosScene.generateOrbit(obj, apoapsis, sphereCollider.radius);
                }
                else {
                    var vec = nextNode.clone();
                    vec.applyMatrix4(line.matrixWorld);

                    var deltaSpeed = obj.trajLine.speedToNode * deltaTime;
                    obj.mesh.lookAt(vec);
                    obj.mesh.translateZ(deltaSpeed);
                    obj.mesh.updateMatrix();
                    //nodes[0].copy(cosmosScene.getWorldPos(obj.mesh)).applyMatrix4(line.matrix);
                    //line.geometry.verticesNeedUpdate = true;
                }
            }
        }
    }

    function updateBodies(timeAdvanced, deltaSeconds, objects) {
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            var orbit = obj.orbit;


            if (obj.hasOwnProperty("dest") && obj.hasOwnProperty("traj") &&
                !obj.hasOwnProperty("trajLine") && obj.orbit != undefined) {

                createTrajLine(obj);
            }

            if (obj.hasOwnProperty("dest") && obj.hasOwnProperty("traj") && obj.traj[0][0] <= _this.getJED() && obj.launched == false) {
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