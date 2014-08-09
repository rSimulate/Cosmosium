if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var day = 'Mon';
var month = 'Jan';
var year = '1969';
var jed = toJED(new Date());    // julian date

var jed_delta = 3;  // how many days per second to elapse

// NOTE: relative scale (exaggeration) parameters now in ephemeris.js

var particle_system_geometry = null;
var using_webgl = true;
var NUM_BIG_PARTICLES = 500;

var canvas, stats, jCanvas;
var camera, controls, scene, renderer, cameraTarget;
var mouse = new THREE.Vector2();
var offset = new THREE.Vector3();
var INTERSECTED;
var projector;
var clock;
var skybox;
var sun;
var addPlanet;

var claimButt = document.getElementById('claim-asteroid-button');

var SHOWING_ASTEROID_CLAIM = !(claimButt == null);

var CAMERA_NEAR = 1;
var CAMERA_FAR = 100000;

var objects = []; // {owner: owner, objectId: objectId, type: type, model: model, orbit: orbit, mesh: mesh}
var players = []; // {player: playerName, color: THREE.Color}

var nextEntityIndex = 0;

var selectedObject = undefined;
var removeBody, updateObjectOwnerById;
var addTestObject;
var SELECTING_TARGET, sourceTarget, requestRemoveBody, requestCourse, cancelCourse, setCourse;

function RSimulate(opts) {

    updateObjectOwnerById = function (newOwner, objectId) {
        // returns objectId if successful
        var object = undefined;
        for (var i = 0; i < objects.length; i++) {
            if (objectId == objects[i].objectId) {
                objects[i].owner = newOwner;
                object = objects[i];
                break;
            }
        }
        if (object != undefined) {
            console.log("ObjectId", objectId, "changed to owner", newOwner);

            var color = getColorForOwner(newOwner);
            if (color) {
                for (var u = 0; u < object.mesh.objects.length; u++) {
                    // Mesh is nested in LOD object
                    var mesh = object.mesh.objects[u].object;
                    mesh.material.uniforms['emissive'].value = color;
                }
            }
            else console.log("Tried to add color to asteroid, but color does not exist for owner", newOwner);
        }
        else console.log(newOwner, "claimed an object, but objectId", objectId, "was not found in client array");
    };

    function addBody( parent, type, orbit, mesh, shouldAlwaysShowEllipse, objectId, model, owner ) {
        shouldAlwaysShowEllipse = typeof shouldAlwaysShowEllipse !== 'undefined' ? shouldAlwaysShowEllipse : true;

        // orbit undefined for sun
        if (orbit != undefined) {
            for (var i = 0; i < objects.length; i++) {
                var obj = objects[i];
                if (obj.orbit != undefined) {
                    if (obj.orbit.name == orbit.name) {
                        console.log("Multiples of the same object sent to the client... Only granting access for one");
                        return;
                    }
                }
            }

            var ellipse = orbit.getEllipse();
            ellipse.visible = shouldAlwaysShowEllipse;
            parent.add(ellipse);
        }


        var obj = {owner: owner, objectId: objectId, type: type, model: model, orbit: orbit, mesh: mesh};
        objects.push(obj);

        nextEntityIndex++;

        if (type == 'playerObject') {
            // append a new object specific button to the list
            var textName = cleanOrbitName(orbit.name);
            $("<li class='playerObject'><a id=" + orbit.name + " href='#'>" + "<i class='fa fa-angle-double-right'></i>" +
                textName + "</a></li>").appendTo('#object-list-container');

            // add listener to object specific div
            document.getElementById(orbit.name).addEventListener('click', function() {
                selectedObject = obj;
                orbitCamera(selectedObject);
            }, false);
        }
        parent.add(mesh);
    }

    requestRemoveBody = function (e) {
        console.log("Called for removal of objectID " + selectedObject.objectId);
        ws.send(message('playerObject',"{'data': {'cmd': 'destroy', 'uuid': '" + selectedObject.objectId + "'}}"));
        e.stopPropagation();
        e.preventDefault();
    };

    requestCourse = function (e) {
        console.log("Requesting to set a new course");

        sourceTarget = selectedObject;
        SELECTING_TARGET = true;
        $('#course-container').show();

        onBodyDeselected();

        e.preventDefault();
    };

    cancelCourse = function(e) {
        console.log("Cancelling new course");

        SELECTING_TARGET = false;
        sourceTarget = undefined;
        $('#course-container').hide();

        onBodyDeselected();

        e.stopPropagation();
        e.preventDefault();
    };

    setCourse = function() {
        console.log("Setting course");
        SELECTING_TARGET = false;
        var destTarget = selectedObject;
        $('#course-container').hide();
        onBodyDeselected();

        orbitCamera(sourceTarget);
        var data = {source: {objectId: sourceTarget.objectId, type: sourceTarget.type},
                    dest: {objectId: destTarget.objectId, type: destTarget.type}};
        var stringify = JSON.stringify(data).replace(/\"+/g, "\'");
        ws.send(message('requestTraj', stringify));
    };

    this.removeAsteroids = function() {
        for(var i = objects.length; i--;) {
            var obj = objects[i];
            if(obj.type === 'asteroid') {
                scene.remove(obj.mesh);
                scene.remove(obj.orbit.getEllipse());
                objects.splice(i, 1);
            }
        }
    };

    this.removeBody = function (parentScene, type, objectId) {
        // Removes a body from the scene
        if (parentScene == undefined) { parentScene = scene; }
        var rmObject;
        if (objectId != undefined) {
            for (var i = 0; i < objects.length; i++) {
                if (objects[i].objectId == objectId) {
                    rmObject = objects[i];
                    objects.splice(i, 1);
                    break;
                }
            }
        }

        if (rmObject == undefined) {
            console.log("Error: Could not find object " + obj.objectId + " to remove");
            return null;
        }

        parentScene.remove(rmObject.mesh);
        if (rmObject.orbit != undefined) parentScene.remove(rmObject.orbit.getEllipse());

        // remove div from player object list
        if (type == "playerObject") {
            $('#'+rmObject.orbit.name).remove();
        }
        orbitCamera(getSolarCentricObject());
        // deselect body, if selected
        onBodyDeselected();
    };

	function makeBodyMesh(size, texture){
		var bodyGeometry = new THREE.SphereGeometry( size, 32, 32 );
		var bodyTexture = THREE.ImageUtils.loadTexture(texture);
		var bodyMaterial = new THREE.MeshLambertMaterial({ map: bodyTexture });

		return new THREE.Mesh(bodyGeometry, bodyMaterial);
	}

    this.addBlenderObjectMesh = function (daePath, object) {

        // object = {owner: owner, objectId: objectId, type: type, model: model, orbit: orbit, // ADDING mesh: mesh}

        var loader = new THREE.ColladaLoader();
        loader.options.convertUpAxis = true;

        // If you had animations, you would add to the second argument function below
        var mesh;
        loader.load(daePath, function (collada) {
            mesh = collada.scene;
            if (mesh != undefined) {
                mesh.scale.x = mesh.scale.y = mesh.scale.z = 5;
                mesh.updateMatrix();

                // add to scene
                addBody(scene, "playerObject", object.orbit, mesh, true, object.objectId, object.model, object.owner);

                // add to player object collection
                object.mesh = mesh;
                objects.push(object);
            }
            else {console.log("ERROR: Parsing blender model failed");}
        });

    };

    function cleanOrbitName(str) {
        var textName = str.replace(/(_)+/g, " ");
        textName = textName.replace(/(--)+/g, "\'");

        return textName;
    }

    addTestObject = function () {
        // NOTE: send ephemeris without a name; the server will assign one
        var cmd = 'create';
        var ephemeris = {
            ma: -2.47311027,
            epoch: 2451545.0,
            a:1.50000261,
            e: 0.01671123,
            i: 0.00101531,
            w_bar: 102.93768193,
            w: 102.93768193,
            L: 100.46457166,
            om: 0,
            P: 365.256
        };
        var type = 'Probe';
        var model = 'Magellan';
        var objectId = 'None';
        var data = {cmd: cmd, type: type, model: model, objectId: objectId, orbit: ephemeris};
        var stringify = JSON.stringify(data).replace(/\"+/g, "\'");
        console.log("Requesting new Object");
        ws.send(message('playerObject', "{'cmd': 'pObjCreate', 'objectId': None, 'type': 'Probe', " +
            "'model': 'Magellan', 'data': "+stringify+'}'));
    };

    function addAsteroid(orbit, mesh, objectId, model, owner) {
        addBody( scene, "asteroid", orbit, mesh, false, objectId, model, owner  );
    }

    function addMoon(planetMesh, orbit, mesh, objectId, model, owner) {
        addBody( planetMesh, "moon", orbit, mesh, false, objectId, model, owner  );
    }

    function onDocumentMouseMove( event ) {
        event.preventDefault();

        // Compatibility fix for Firefox; event.offsetX/Y is not supported in FF
        var offsetX = event.offsetX == undefined ? event.layerX : event.offsetX;
        var offsetY = event.offsetY == undefined ? event.layerY : event.offsetY;

        mouse.x = ( offsetX / $(canvas).width() ) * 2 - 1;
        mouse.y = - ( offsetY / $(canvas).height() ) * 2 + 1;

        var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
        projector.unprojectVector( vector, camera );

        var raycaster = new THREE.Raycaster( camera.position,
                        vector.sub( camera.position ).normalize() );
        var intersects = raycaster.intersectObjects( scene.children, true );

        if ( intersects.length > 0 ) {
            if ( INTERSECTED != intersects[ 0 ].object ) {
                //if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
                INTERSECTED = intersects[ 0 ].object;
                //INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            }
            canvas.style.cursor = 'pointer';
        } else {
            //if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
            INTERSECTED = null;
            canvas.style.cursor = 'auto';
        }
    }

    function rainbow(numOfSteps, step) {
        // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
        // Adam Cole, 2011-Sept-14
        // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
        var r, g, b;
        var h = step / numOfSteps;
        var i = ~~(h * 6);
        var f = h * 6 - i;
        var q = 1 - f;
        switch(i % 6){
            case 0: r = 1, g = f, b = 0; break;
            case 1: r = q, g = 1, b = 0; break;
            case 2: r = 0, g = 1, b = f; break;
            case 3: r = 0, g = q, b = 1; break;
            case 4: r = f, g = 0, b = 1; break;
            case 5: r = 1, g = 0, b = q; break;
        }

        return new THREE.Color(r,g,b);
    }

    function hideAllConditionalEllipses() {
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            if (obj.type == 'asteroid' || obj.type == 'moon') {
                obj.orbit.getEllipse().visible = false;
            }
        }
    }

    function getSolarCentricObject() {
        var obj;
        for (var i = 0; i < objects.length; i++) {
            if (objects[i].type == 'star') {
                obj = objects[i];
            }
        }
        if (obj) {
            return obj;
        }
        // return current target if solar centric object doesn't exist
        return cameraTarget;
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
    }

    function onBodySelected(mesh) {
        hideAllConditionalEllipses();
        var obj = undefined;

        var checkChildrenForId = function(children, id) {
            for (var i = 0; i < children.length; i++){
                var child = children[i];
                if (child.id == id) {
                    return true;
                }
                else if (child.children != undefined) {
                    var result = checkChildrenForId(child.children, id);
                    if (result == true) {
                        return true;
                    }
                }
            }
        };

        for (var i = 0; i < objects.length; i++) {
            var object = objects[i];
            if (object.mesh.id == mesh.id) {
                obj = object;
            }
            else if (object.mesh.children != undefined) {
                var result = checkChildrenForId(object.mesh.children, mesh.id);
                if (result == true) obj = object;
            }
        }

        if (obj == undefined) {
            console.log("ERROR: Could not find selected object's ID");
            return;
        }

        var orbit = obj.orbit, courseTarget;
        if (orbit != undefined) {
            orbit.getEllipse().visible = true;
            if (orbit && orbit.eph && orbit.eph.full_name) {
                bodyName = cleanOrbitName(orbit.eph.full_name);
            } else if (orbit && orbit.name) {
                bodyName = cleanOrbitName(orbit.name);
            }
            var infoHTML = "<h3>" + bodyName + "</h3>";
            // info to show in the window:
            for (var key in orbit.eph) {
                // excluded info:
                if (key.slice(0, 6) == 'sigma_'
                    || key.slice(-6) == '_sigma'
                    || key == 'full_name'
                    || key == 'epoch_mjd'
                    || key == 'rms'
                    || key == 'neo'
                    || key == 'equinox'
                    || key == 'spkid'
                    || key == 'per'
                    || key == 'id'
                    || key == 'data_arc'
                    || key == 'condition_code'
                    || key == 'prov_des'
                    || key == 'moid_ld'
                    || key == 'orbit_id'
                    || key == 'two_body'
                    || key == 'G'
                    || key == 'e'
                    || key == 'class'
                    || key == 'a'
                    || key == 'name'
                    || key == 'i'
                    || key == 'tp'

                    /* i'm not sure what these next ones are... maybe they should be included and renamed? */
                    || key == 'K2'
                    || key == 'K1'
                    || key == 'M1'
                    || key == 'M2'
                    || key == 'DT'
                    || key == 'pha'
                    || key == 'PC'
                    || key == 'A1'
                    || key == 'A2'
                    || key == 'A3'
                    || key == 'ad'
                    || key == 'saved'
                    || key == 'per_y'
                    || key == 'epoch_cal'
                    || key == 'epoch'
                    || key == 'IR'
                    || key == 'extent'
                    || key == 'tp_cal'
                    || key == 'pdes'
                    || key == 't_jup'
                    || key == 'om'
                    || key == 'ma'
                    || key == 'prefix'
                    || key == 'q'
                    || key == 'w'
                    || key == 'n'
                    || key == 'n_del_obs_used'
                    || key == 'n_dop_obs_used'

                    ) {
                    continue
                }
                infoHTML += "<p><b>" + key + "</b>: " + orbit.eph[key] + "</p>";
            }
            // make this display the owner name...
            if (obj.type == 'Probe' || obj.type == 'asteroid') {
                $("#owner-info").html('claimed by <b>"' + obj.owner + '"</b>')
                    //.attr("color", "rgb(" + ownerColor.r + ',' + ownerColor.g + ',' + ownerColor.b + ')')
                    .html('<b>' + obj.owner + '</b>').attr("color", 'rgb(200,200,200)');

                $('#player-object-container').hide();
                $('#claim-asteroid-button').hide();
                // TODO: Only display removal button of owned objects
                if (obj.type == 'Probe') $('#player-object-container').show();
                else if (obj.type == 'asteroid') $('#claim-asteroid-button').show();
            }
            $("#body-info").html(infoHTML);
        }
        else {
            $("#body-info").html(obj.model);
        }

        $("#body-info-container").show();

        selectedObject = obj;

        orbitCamera(selectedObject);
    }

    function onDocumentMouseDown( event ) {
        event.preventDefault();
        if (event.button == 0) {
            var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
            projector.unprojectVector( vector, camera );

            var raycaster = new THREE.Raycaster( camera.position,
                vector.sub( camera.position ).normalize() );

            var intersects = raycaster.intersectObjects( scene.children, true );

            if ( intersects.length > 0 ) {

                onBodySelected(intersects[ 0 ].object);

            } else {
                onBodyDeselected();
            }
        }
        else if (event.button == 1) {
            orbitCamera(getSolarCentricObject());
            onBodyDeselected();
        }
        else if (event.button == 2) {
            cameraTarget = undefined;
            onBodyDeselected();
        }
    }

    function onDocumentMouseUp( event ) {

        event.preventDefault();

        canvas.style.cursor = 'auto';

    }

    function onBodyDeselected() {
        hideAllConditionalEllipses();
        $("#body-info-container").hide();
        $('#player-object-container').hide();
        $('#claim-asteroid-button').hide();
        selectedObject = undefined;
    }

    function init() {
        initCamera();

        scene = new THREE.Scene();

        clock = new THREE.Clock();
        clock.start();

        // world

        initGeometry();

        initSkybox();

        // lights
        initLights();

        // renderer
        initRenderer();

        initStats();
        //

        window.addEventListener( 'resize', onWindowResize, false );

        initUI();
    }

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    function initSkybox() {
        var geometry = new THREE.SphereGeometry(CAMERA_FAR / 2.0, 60, 40);

        var uniforms = {
            texture: {
                type: 't',
                value: THREE.ImageUtils.loadTexture('img/eso_dark.jpg')
            }
        };

        var material = new THREE.ShaderMaterial( {
          uniforms:       uniforms,
          vertexShader:   document.getElementById('sky-vertex').textContent,
          fragmentShader: document.getElementById('sky-fragment').textContent
        });

        skybox = new THREE.Mesh(geometry, material);
        skybox.scale.set(-1, 1, 1);
        skybox.eulerOrder = 'XZY';
        //skybox.rotation.z = Math.PI/2.0;
        skybox.rotation.x = Math.PI;
        skybox.renderDepth = 1000.0;
        scene.add(skybox);
    }

    function initGeometry() {
        initSolarSystem();

    }

    function initSolarSystem() {
        initSun();
    }

    function getColorForOwner(owner) {
        for (var i = 0; i < players.length; i++) {
            var player = players[i];
            if (player.player == owner) return player.color;
        }
    }

    this.addNewAsteroid = function(asteroid) {

        var geometry = [
            [new THREE.SphereGeometry( 1, 6, 6 ), 300],
            [new THREE.SphereGeometry( 1, 5, 5 ), 600],
            [new THREE.SphereGeometry( 1, 4, 4 ), 1000]
        ];

        var lambertShader = THREE.ShaderLib['lambert'];
        var uniforms = THREE.UniformsUtils.clone(lambertShader.uniforms);
        uniforms.map.value = THREE.ImageUtils.loadTexture('img/textures/asteroid_small.jpg');

        var vertexShaderText = document.getElementById("asteroid-vertex").textContent;
        var fragmentShaderText = lambertShader.fragmentShader;

        var useBigParticles = !using_webgl;

        var baseAsteroidSize = ASTEROID_SIZE;
        if (asteroid.orbitExtras.diameter && asteroid.orbitExtras.diameter !== "_") {
            baseAsteroidSize *= (asteroid.orbitExtras.diameter/100.0);
        }

        // color asteroids based on ownership
        uniforms.diffuse.value = new THREE.Color(0x313131);
        var color = getColorForOwner(asteroid.owner);
        if (color) {
            uniforms.emissive.value = color;
        }

        //var display_color = i < NUM_BIG_PARTICLES ? opts.top_object_color : displayColorForObject(asteroid);
        var asteroidOrbit = new Orbit3D(asteroid.orbit, {
          color: 0xcccccc,
          display_color: 0x00ff00,
          width: 2,
            //TODO: I'm not sure how the object_size needs to be configured
          object_size: 1 < NUM_BIG_PARTICLES ? 50 : 15, //1.5,
          jed: jed,
          particle_geometry: particle_system_geometry, // will add itself to this geometry
          name: asteroid.orbit.full_name
        }, useBigParticles);

        var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShaderText,
            fragmentShader: fragmentShaderText,
            fog: true,
            lights: true
        });
        material.map = true;

        var lod = new THREE.LOD();

        // randomize the shape a tiny bit
        var scale = [baseAsteroidSize * (Math.random() + 0.5),
                baseAsteroidSize * (Math.random() + 0.5),
                baseAsteroidSize * (Math.random() + 0.5)];

        // give the asteroids a little random initial rotation so they don't look like eggs standing on end
        var rot = [
                Math.random() * 2.0 * Math.PI,
                Math.random() * 2.0 * Math.PI,
                Math.random() * 2.0 * Math.PI];

        for (var i = 0; i < geometry.length; i++) {
            var asteroidMesh = new THREE.Mesh( geometry[i][0], material );

            asteroidMesh.scale.set(scale[0], scale[1], scale[2]);
            asteroidMesh.rotation.set(rot[0], rot[1], rot[2]);

            lod.addLevel( asteroidMesh, geometry[i][1]);
        }



        addAsteroid(asteroidOrbit, lod, asteroid.objectId, asteroid.type, asteroid.owner);
    };

    function asteroidIsOwned(asteroid) {
        return (Math.random() > 0.5);
    }

	//From http://www.html5rocks.com/en/tutorials/casestudies/100000stars/
	//
	// function addSunFlare(x,y,z, size, overrideImage){
	  // var flareColor = new THREE.Color( 0xffffff );

	  // lensFlare = new THREE.LensFlare( overrideImage, 700, 0.0, THREE.AdditiveBlending, flareColor );

	  // //	we're going to be using multiple sub-lens-flare artifacts, each with a different size
	  // lensFlare.add( textureFlare1, 4096, 0.0, THREE.AdditiveBlending );
	  // lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
	  // lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
	  // lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );

	  // //	and run each through a function below
	  // lensFlare.customUpdateCallback = lensFlareUpdateCallback;

	  // lensFlare.position = new THREE.Vector3(x,y,z);
	  // lensFlare.size = size ? size : 16000 ;
	  // return lensFlare;
	// }

    function initSun() {
        //Create Sun Model
		var sphereGeometry = new THREE.SphereGeometry( SUN_SIZE, 32, 32 );
		//var sunTexture = THREE.ImageUtils.loadTexture('img/textures/sun_small.jpg');
        var time = clock.getElapsedTime();
        var uniforms = {
            texture: {
                type: 't',
                value: THREE.ImageUtils.loadTexture('img/textures/sun_small.jpg')
            },
            glow: {
                type: 't',
                value: THREE.ImageUtils.loadTexture('img/textures/sun_glow.jpg')
            },
            time: {
                type: 'f',
                value: time
            }
        };

        var vertexShaderText = document.getElementById("sun-vertex").textContent;
        var fragmentShaderText = document.getElementById("sun-fragment").textContent;

        var sunMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShaderText,
            fragmentShader: fragmentShaderText,
            lights:false,
            fog: true
        });

        sun = new THREE.Mesh( sphereGeometry, sunMaterial );
        addBody(scene, 'star', undefined, sun, false, nextEntityIndex, "Sun", "Mankind");

		//Create SunFlare
        //var sunflare = lensFlare(0,0,0, SUN_SIZE*1.05, 'img/textures/lensflare0.png');

    }

    function animateSun() {
       sun.material.uniforms['time'].value = clock.getElapsedTime();
    }

    function getObjectByOrbitName(objName) {
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            if (obj.orbit) {
                if (obj.orbit.name && obj.orbit.name == objName) return obj;
                if (obj.orbit.full_name && obj.orbit.full_name == objName) return obj;
            }
        }
        console.log("could not find", objName);
    }

    addPlanet = function(planet) {
        //var moonGeometry = new THREE.SphereGeometry( MOON_SIZE, 16, 16 );
        //var moonMaterial = new THREE.MeshLambertMaterial( {color: 0xcccccc} );
        var mesh = undefined;
        var parent = scene;
        if (planet.type == 'planet') {
            if (planet.model == 'Mercury') {
                mesh = makeBodyMesh(MERCURY_SIZE, 'img/textures/mercury_small.jpg');
            }
            else if (planet.model == 'Venus') {
                mesh = makeBodyMesh(VENUS_SIZE, 'img/textures/venus_small.jpg');
            }
            else if (planet.model == 'Earth') {
                mesh = makeBodyMesh(EARTH_SIZE, 'img/textures/earth_small.jpg');
            }
            else if (planet.model == 'Mars') {
                mesh = makeBodyMesh(MARS_SIZE, 'img/textures/mars_small.jpg');
            }
            else if (planet.model == 'Jupiter') {
                mesh = makeBodyMesh(JUPITER_SIZE, 'img/textures/jupiter_small.jpg');
            }

            addBody(parent, planet.type, planet.orbit, mesh, true, planet.objectId, planet.model, planet.owner);
        }
        else if (planet.type == 'moon') {
            if (planet.model == 'Moon') {
                mesh = makeBodyMesh(LUNA_SIZE, 'img/textures/moon_small.jpg');
                parent = getObjectByOrbitName('Earth').mesh;
            }
            else if (planet.model == 'Io') {
                mesh = makeBodyMesh(IO_SIZE, 'img/textures/moon_small.jpg');
                parent = getObjectByOrbitName('Jupiter').mesh;
            }
            else if (planet.model == 'Europa') {
                mesh = makeBodyMesh(EUROPA_SIZE, 'img/textures/moon_small.jpg');
                parent = getObjectByOrbitName('Jupiter').mesh;
            }
            else if (planet.model == 'Ganymede') {
                mesh = makeBodyMesh(GANYMEDE_SIZE, 'img/textures/moon_small.jpg');
                parent = getObjectByOrbitName('Jupiter').mesh;
            }
            else if (planet.model == 'Callisto') {
                mesh = makeBodyMesh(CALLISTO_SIZE, 'img/textures/moon_small.jpg');
                parent = getObjectByOrbitName('Jupiter').mesh;
            }
            else if (planet.model == 'Phobos') {
                mesh = makeBodyMesh(PHOBOS_SIZE, 'img/textures/phobos_tiny.jpg');
                parent = getObjectByOrbitName('Mars').mesh;
            }
            else if (planet.model == 'Deimos') {
                mesh = makeBodyMesh(DEIMOS_SIZE, 'img/textures/deimos_tiny.jpg');
                parent = getObjectByOrbitName('Mars').mesh;
            }
            addBody(parent, planet.type, planet.orbit, mesh, false, planet.objectId, planet.model, planet.owner);
        }
    };

    function initCamera() {

        camera = new THREE.PerspectiveCamera( 60, $(canvas).width() / $(canvas).height(), CAMERA_NEAR, CAMERA_FAR );
        camera.position.z = 500;
    }

    function initLights() {
        var light = new THREE.PointLight( 0xffffff, 2, 10000);
        light.position.set(0,0,0);  // sun
        scene.add(light);

        light = new THREE.AmbientLight( 0x222222 );
        scene.add( light );
    }

    function initRenderer() {
        projector = new THREE.Projector();

        renderer = new THREE.WebGLRenderer( { antialias: false } );
        //renderer.setSize( window.innerWidth, window.innerHeight );

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

    function initStats() {
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        stats.domElement.style.zIndex = 1010;
        $('#canvas').append( stats.domElement );
    }

    function onWindowResize() {
        camera.aspect = $(canvas).width() / $(canvas).height();
        camera.updateProjectionMatrix();

        renderer.setSize($(canvas).width(), $(canvas).height());

        render();
    }

    function update(deltaSeconds) {
        var timeAdvanced = jed_delta*deltaSeconds;
        jed += jed_delta*deltaSeconds;

        updateBodies(timeAdvanced, objects);
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

    function initUI() {

        // wipe object list on init to clean things that might have been left over from a refresh event
        $('.playerObject').remove();

        $('#player-object-container').hide();
        $('#course-container').hide();

        // update top menu bar every second
        setInterval(function () {
            var el = document.getElementById('gametime');
            el.innerHTML = day+' '+month+' '+year;
        }, 1000);
    }

    function animate() {
        requestAnimationFrame(animate);

        update(clock.getDelta());
        animateSun();

        render();
        stats.update();
        orbitCamera(undefined);

    }

    function render() {
        scene.traverse( function ( node ) { if ( node instanceof THREE.LOD ) node.update( camera ) } );

        renderer.render( scene, camera );
    }

    init();
    animate();
}


// the following is needed to have relative URLs to different ports
// delegate event for performance, and save attaching a million events to each anchor
document.addEventListener('click', function(event) {
  var target = event.target;
  if (target.tagName.toLowerCase() == 'a')
  {
      var port = target.getAttribute('href').match(/^:(\d+)(.*)/);
      if (port)
      {
         target.href = port[2];
         target.port = port[1];
      }
  }
}, false);

if (SHOWING_ASTEROID_CLAIM){
    // link to add the asteroid
    function claimButt_onClick(e){
        e = e || window.event;
        e.stopPropagation();
        var obj = {owner: selectedObject.owner, objectId: selectedObject.objectId, orbitName: selectedObject.orbit.name};
        var stringify = JSON.stringify(obj).replace(/\"+/g, "\'");
        ws.send(message('claim',stringify));
        
    }
    claimButt.addEventListener('click', claimButt_onClick, false);
}



var rSimulate;

$(document).ready(function(){
    $("#body-info-container").hide();
    $("#dash").show();

    console.log("Refreshing webGL canvas")
});

// called once the webSocket makes a complete connection in webSocketSetup.js.tpl
function initrSimulate() {
    // refresh webGL
    rSimulate = new RSimulate({});
    jCanvas = $('#canvas');

    // Configure webGL canvas to conform to parent div
    $(renderer.domElement).css('height', '');
    renderer.setSize(jCanvas.width(), jCanvas.height());
    camera.aspect = jCanvas.width() / jCanvas.height();
    camera.updateProjectionMatrix();

    ws.send(message('refresh','None'));
}