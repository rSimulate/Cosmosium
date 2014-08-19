var CosmosRender = new function (cosmosScene, cosmosUI) {
    var _this = this;
    this.day = 'Mon';
    this.month = 'Jan';
    this.year = '1969';
    this.jed = toJED(new Date());    // julian date
    var jed_delta = 3;  // how many days per second to elapse
    var using_webgl = true; // TODO;
    var camera, farCamera;
    this.CAMERA_NEAR = 75;
    this.CAMERA_FAR = 1000000;
    this.FOCAL_LENGTH = 60;

    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    var canvas, jCanvas, composer;

    this.init = new function () {
        _this.clock = new THREE.Clock();
        _this.clock.start();

        canvas = document.getElementById('canvas');
        jCanvas = $('#canvas');

        initCamera();
        initRenderer();

        // Configure webGL canvas to conform to parent div
        $(_this.renderer.domElement).css('height', '');
        _this.renderer.setSize(jCanvas.width(), jCanvas.height());
        camera.aspect = $(canvas).width() / $(canvas).height();
        farCamera.aspect = $(canvas).width() / $(canvas).height();
        camera.updateProjectionMatrix();
        farCamera.updateProjectionMatrix();
    };

    this.getClock = new function () {return _this.clock;};

    this.animate = new function () {
        requestAnimationFrame(_this.animate, undefined);

        update(_this.clock.getDelta());
        cosmosUI.update();

        render();

    };

    this.orbitCamera = new function (originObj, cameraTarget) {
        if (originObj == undefined && cameraTarget != undefined) {
            // Called from animate() to update every frame to keep origin position
            if (cameraTarget.type == 'moon') {
                this.controls.target = cameraTarget.mesh.parent.position.clone();
            }
            else {
                this.controls.target = cameraTarget.mesh.position.clone();
            }
        }
        else if (originObj != undefined) {
            cameraTarget = originObj;
            if (originObj.type == 'moon') {
                this.controls.target = originObj.mesh.parent.position.clone();
            }
            else {
                this.controls.target = originObj.mesh.position.clone();
            }

        }


        // ensure origin target keeps ellipse displayed
        if (cameraTarget && cameraTarget.orbit) cameraTarget.orbit.getEllipse().visible = true;

        this.controls.update();
        farCamera.position.copy(camera.position);
        farCamera.rotation.copy(camera.rotation);

        if (this.bokehPass && cameraTarget) {
            this.bokehPass.enabled = true;
            var dist = Math.abs(cameraTarget.mesh.position.distanceTo(camera.position));
            var cullDist = dist + cameraTarget.mesh.geometry.boundingSphere.radius;

            // adjust bokeh culling to be past target object
            if (dist < 400) {
                _this.CAMERA_NEAR = dist;
                camera.far = cullDist;
                farCamera.near = cullDist;
                camera.updateProjectionMatrix();
                farCamera.updateProjectionMatrix();
            }
            // Distance check to remove aberrations from the bokeh shader
            if (dist >= 400) dist = 400;
            this.bokehPass.materialBokeh.uniforms.focalDepth.value = dist;
        }
        else if (this.bokehPass && cameraTarget == undefined) this.bokehPass.enabled = false;
    };

    this.getCamera = new function (isFar) {
        if (isFar) return farCamera;
        return camera;
    };

    function render() {
        composer.render(0.1);
    }

    function onWindowResize() {
        camera = $(canvas).width() / $(canvas).height();
        farCamera.aspect = $(canvas).width() / $(canvas).height();
        camera.updateProjectionMatrix();
        farCamera.updateProjectionMatrix();

        _this.renderer.setSize($(canvas).width(), $(canvas).height());

        render();
    }

    function initCamera() {
        camera = new THREE.PerspectiveCamera( FOCAL_LENGTH, $(canvas).width() / $(canvas).height(), 1, CAMERA_NEAR );
        farCamera = new THREE.PerspectiveCamera( FOCAL_LENGTH, $(canvas).width() / $(canvas).height(),
                _this.CAMERA_NEAR - 1, _this.CAMERA_FAR );
        camera.position.z = 500;
        farCamera.position = camera.position.clone();
        farCamera.rotation = camera.rotation.clone();
    }

    function initRenderer() {

        _this.renderer.autoClear = false;

        composer = new THREE.EffectComposer(_this.renderer);

        var farPass = new THREE.RenderPass(cosmosScene.getScene(), farCamera);
        composer.addPass(farPass);

        var copyPass = new THREE.ShaderPass(THREE.CopyShader);
        copyPass.renderToScreen = false;
        composer.addPass(copyPass);

        this.bokehPass = new THREE.Bokeh2Pass(cosmosScene.getScene(), farCamera, {
            shaderFocus: {type: 'i', value: 0},
            focusCoords: {type: 'v2', value: new THREE.Vector2(0.5, 0.5)},
            znear: {type: 'f', value: parseFloat(_this.CAMERA_NEAR)},
            zfar: {type: 'f', value: parseFloat(_this.CAMERA_FAR)},

            fstop: {type: 'f', value: _this.CAMERA_NEAR / 10},
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

        this.bokehPass.renderToScreen = false;
        this.bokehPass.needsSwap = true;
        composer.addPass(this.bokehPass);

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
        var wDiff = $(document.body).width() - sidebarWidth;
        $('#canvas').append(_this.renderer.domElement).css('width', wDiff).css('height', hDiff).css('top', navbarHeight);


        this.controls = new THREE.OrbitControls(camera, renderer.domElement);

        _this.renderer.domElement.addEventListener('mousemove', cosmosUI.onDocumentMouseMove, false);
        _this.renderer.domElement.addEventListener('mousedown', cosmosUI.onDocumentMouseDown, false);
        _this.renderer.domElement.addEventListener('mouseup', cosmosUI.onDocumentMouseUp, false);
    }


    function update(deltaSeconds) {
        animateSun();
        // Update LODs based on distance
        this.scene.traverse(function (node) {
            if (node instanceof THREE.LOD) node.update(camera)
        });

        var timeAdvanced = jed_delta * deltaSeconds;
        _this.jed += jed_delta * deltaSeconds;

        updateBodies(timeAdvanced, cosmosScene.getObjects());

        _this.orbitCamera();
    }

    function animateSun() {
        cosmosScene.getSolarCentricObject().mesh.material.uniforms['time'].value = this.clock.getElapsedTime();
    }

    function updateBodies(timeAdvanced, objects) {
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            var orbit = obj.orbit;
            if (orbit != undefined) {
                var helioCoords = orbit.getPosAtTime(_this.jed);
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