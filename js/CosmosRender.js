var CosmosRender = function (cosmosScene, cosmosUI) {
    var _this = this;
    var jed = toJED(new Date());    // julian date
    var jed_delta = 3;  // how many days per second to elapse
    var using_webgl = true;
    var camera, farCamera;
    var CAMERA_NEAR = 75;
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
        if (originObj == undefined && cameraTarget != undefined) {
            // Called from animate() to update every frame to keep origin position
            if (cameraTarget.type == 'moon') {
                controls.target = cameraTarget.mesh.parent.position.clone();
            }
            else {
                controls.target = cameraTarget.mesh.position.clone();
            }
        }
        else if (originObj != undefined) {
            cameraTarget = originObj;
            if (originObj.type == 'moon') {
                controls.target = originObj.mesh.parent.position.clone();
            }
            else {
                controls.target = originObj.mesh.position.clone();
            }

        }

        // ensure origin target keeps ellipse displayed
        if (cameraTarget && cameraTarget.orbit) cameraTarget.orbit.getEllipse().visible = true;

        controls.update();
        farCamera.position.copy(camera.position);
        farCamera.rotation.copy(camera.rotation);

        if (bokehPass && cameraTarget) {
            bokehPass.enabled = true;
            var dist = Math.abs(cameraTarget.mesh.position.distanceTo(camera.position));

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

            var cullDist = dist + radius;

            // adjust bokeh culling to be past target object
            if (cullDist < 400) {
                CAMERA_NEAR = cullDist;
                camera.far = cullDist;
                farCamera.near = cullDist;
                camera.updateProjectionMatrix();
                farCamera.updateProjectionMatrix();
            }

            // adjust distance for bokeh shader to accompany blurring for large objects
            dist -= radius / 2;

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

        updateBodies(timeAdvanced, cosmosScene.getObjects());

        _this.orbitCamera();
    }

    function animateSun() {
        cosmosScene.getSolarCentricObject().mesh.material.uniforms['time'].value = _this.getClock().getElapsedTime();
    }

    function updateBodies(timeAdvanced, objects) {
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            var orbit = obj.orbit;
            if (orbit != undefined) {
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
        }
    }
};