

function CosmosRender () {
    var day = 'Mon';
    var month = 'Jan';
    var year = '1969';
    var jed = toJED(new Date());    // julian date
    var jed_delta = 3;  // how many days per second to elapse

    this.init = function() {
        clock = new THREE.Clock();
        clock.start();

        initRenderer();
    }

    function animate() {
        requestAnimationFrame(animate);

        update(clock.getDelta());
        animateSun();

        render();
        stats.update();

    }

    function render() {
        // Update LODs based on distance
        scene.traverse( function ( node ) { if ( node instanceof THREE.LOD ) node.update( camera ) } );

        composer.render( 0.1 );
        //renderer.render( scene, camera );
    }

    function initRenderer() {

        projector = new THREE.Projector();

        renderer = new THREE.WebGLRenderer( { antialias: false } );
        renderer.autoClear = false;

        composer = new THREE.EffectComposer( renderer );

        var farPass = new THREE.RenderPass( scene, farCamera);
        composer.addPass( farPass );

        var copyPass = new THREE.ShaderPass( THREE.CopyShader );
        copyPass.renderToScreen = false;
        composer.addPass ( copyPass );

        bokehPass = new THREE.Bokeh2Pass( scene, farCamera, {
            shaderFocus: {type: 'i', value: 0},
            focusCoords: {type: 'v2', value: new THREE.Vector2(0.5, 0.5)},
            znear: {type: 'f', value: parseFloat(CAMERA_NEAR)},
            zfar: {type: 'f', value: parseFloat(CAMERA_FAR)},

            fstop: {type: 'f', value: CAMERA_NEAR / 10},
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
        } );
        /*
         bokehPass = new THREE.BokehPass( scene, camera, {
         focus: 1.0,
         aspect: 1.0,
         aperture: 0.025,
         maxblur: 1.0
         });*/
        bokehPass.renderToScreen = false;
        bokehPass.needsSwap = true;
        composer.addPass( bokehPass );

        copyPass.renderToScreen = false;
        composer.addPass( copyPass );

        var nearPass = new THREE.RenderPass( scene, camera );
        nearPass.renderToScreen = false;
        nearPass.clear = false;
        nearPass.clearDepth = true;

        composer.addPass( nearPass );

        var finalPass = new THREE.ShaderPass( THREE.CopyShader );
        finalPass.renderToScreen = true;
        composer.addPass( finalPass );

        canvas = document.getElementById('canvas');

        // adjust height for navbar and append
        var navbarHeight = $('#topNavbar').height();
        var hDiff = $(document.body).height() - navbarHeight - 1;
        var sidebarWidth = $('#left-sidebar').width();
        var wDiff = $(document.body).width() - sidebarWidth;
        $('#canvas').append( renderer.domElement).css('width', wDiff).css('height', hDiff).css('top', navbarHeight);


        controls = new THREE.OrbitControls( camera, renderer.domElement );

        renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
        renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
        renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
    }

    function orbitCamera(originObj) {
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

        if ( bokehPass && cameraTarget ) {
            bokehPass.enabled = true;
            var dist = Math.abs(cameraTarget.mesh.position.distanceTo(camera.position));
            var cullDist = dist+ cameraTarget.mesh.geometry.boundingSphere.radius;

            // adjust bokeh culling to be past target object
            if (dist < 400) {
                CAMERA_NEAR = dist;
                camera.far = cullDist;
                farCamera.near = cullDist;
                camera.updateProjectionMatrix();
                farCamera.updateProjectionMatrix();
            }
            // Distance check to remove aberrations from the bokeh shader
            if (dist >= 400) dist = 400;
            bokehPass.materialBokeh.uniforms.focalDepth.value = dist;
        }
        else if ( bokehPass && cameraTarget == undefined) bokehPass.enabled = false;
    }


    function update(deltaSeconds) {
        var timeAdvanced = jed_delta*deltaSeconds;
        jed += jed_delta*deltaSeconds;

        updateBodies(timeAdvanced, objects);

        orbitCamera();
    }

    function animateSun() {
        sun.mesh.material.uniforms['time'].value = clock.getElapsedTime();
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
}