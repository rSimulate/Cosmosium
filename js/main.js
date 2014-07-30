if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

  var jed = toJED(new Date());    // julian date

    var jed_delta = 5;  // how many days per second to elapse
    
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

    var claimButt = document.getElementById('claim-asteroid-button');

    var SHOWING_ASTEROID_OWNERSHIP = (typeof owners === "object");
    var SHOWING_ASTEROID_CLAIM = !(claimButt == null);

    var CAMERA_NEAR = 1;
    var CAMERA_FAR = 100000;

    var objects = []; // {owner: owner, objectId: objectId, type: type, model: model, orbit: orbit, mesh: mesh}

    var nextEntityIndex = 0;

    var mapFromOwnerNameToColor = {};

    var selectedObject = undefined;
    var removeBody;
    var addTestObject;

function RSimulate(opts) {



    function addBody( parent, type, orbit, mesh, shouldAlwaysShowEllipse, objectId, model, owner ) {
        shouldAlwaysShowEllipse = typeof shouldAlwaysShowEllipse !== 'undefined' ? shouldAlwaysShowEllipse : true;
        objectId = typeof objectId !== 'undefined' ? objectId : nextEntityIndex;

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
            parent.add(ellipse)
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

    function requestRemoveBody(e) {
        console.log("Called for removal of objectID " + selectedObject.objectId);
        ws.send(message('playerObject',"{'data': {'cmd': 'destroy', 'uuid': '" + selectedObject.objectId + "'}}"));
        e.stopPropagation();
        e.preventDefault();
    }

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


    function addPlanet(orbit, planetmesh, objectId, model) {
		addBody( scene, "planet", orbit, planetmesh, true, objectId, model, "Mankind" );
    }

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
        mouse.x = ( event.offsetX / $(canvas).width() ) * 2 - 1;
        mouse.y = - ( event.offsetY / $(canvas).height() ) * 2 + 1;

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
        cameraTarget = originObj;
        if (originObj.type == 'moon') {
            controls.target = originObj.mesh.parent.position.clone();
        }
        else {
            controls.target = originObj.mesh.position.clone();
        }
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

        var orbit = obj.orbit;
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
            if (SHOWING_ASTEROID_OWNERSHIP) {
                // TODO: Reninstate Asteroid ownership colors
                /*var ownerName = obj.owner;
                 var ownerColor = mapFromOwnerNameToColor[ownerName];
                 console.log('claimed by "' + ownerName + '", color=(' + ownerColor.b + ',' + ownerColor.g + ',' + ownerColor.r + ')');*/
                $("#owner-info").html('claimed by <b>"' + obj.owner + '"</b>')
                    //.attr("color", "rgb(" + ownerColor.r + ',' + ownerColor.g + ',' + ownerColor.b + ')')
                    .html('<b>' + obj.owner + '</b>').attr("color", 'rgb(200,200,200)');

                //var userName = readCookie('cosmosium_login');
                $('#destroy-object-container').hide();
                $('#claim-asteroid-button').hide();
                // TODO: Only display removal button of owned objects
                if (obj.type == 'Probe') $('#destroy-object-container').show();
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
        console.log(event.button);
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
        else if (event.button == 2) {
            orbitCamera(getSolarCentricObject());
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
        $('#destroy-object-container').hide();
        $('#claim-asteroid-button').hide();
        selectedObject = undefined;
    }

    function init() {
        initCamera();

        scene = new THREE.Scene();

        clock = new THREE.Clock();
        clock.start();

        // world

        if (SHOWING_ASTEROID_OWNERSHIP) {
            initOwners();
        }

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

    function initOwners() {
        if (owners) {

            var uniqueOwners = owners.filter(onlyUnique);
            var numUniqueOwners = uniqueOwners.length;


            for (var i = 0; i < numUniqueOwners; i++) {
                if (!mapFromOwnerNameToColor[uniqueOwners[i]]) {
                    mapFromOwnerNameToColor[uniqueOwners[i]] = rainbow(numUniqueOwners, i);
                }
            }
        }

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
        initPlanets();
    }

    this.addNewAsteroid = function(asteroid) {

        var geometry = [
            [new THREE.SphereGeometry( 1, 6, 6 ), 300],
            [new THREE.SphereGeometry( 1, 5, 5 ), 600],
            [new THREE.SphereGeometry( 1, 4, 4 ), 1000],
        ];

        var lambertShader = THREE.ShaderLib['lambert'];
        var uniforms = THREE.UniformsUtils.clone(lambertShader.uniforms);

        var vertexShaderText = document.getElementById("asteroid-vertex").textContent;
        var fragmentShaderText = lambertShader.fragmentShader;

        var useBigParticles = !using_webgl;

        // first iterate and find the range of values for magnitude (H)
        var minH = asteroid.orbitExtras.H;
        var maxH = asteroid.orbitExtras.H;



        var baseAsteroidSize = ASTEROID_SIZE;
        if (asteroid.orbitExtras.diameter && asteroid.orbitExtras.diameter !== "_") {
            baseAsteroidSize *= (asteroid.orbitExtras.diameter/100.0);
        }

        if (asteroid.orbitExtras.H && asteroid.orbitExtras.H !== "_") {  // magnitude
            var percentageDark = (asteroid.orbitExtras.H - minH) / (maxH - minH);
            //uniforms.diffuse.value = new THREE.Color(percentageDark, percentageDark, percentageDark);
            uniforms.diffuse.value = new THREE.Color( 0x696969 );
        }

        // color asteroids based on ownership
        if (SHOWING_ASTEROID_OWNERSHIP) {

            var ownerName = asteroid.owner;
            // TODO: Assign colors for players by user
            /*
            if (ownerName) {
                var ownerColor = mapFromOwnerNameToColor[ownerName];

                fragmentShaderText = basicShader.fragmentShader;

                uniforms.diffuse.value = ownerColor;
            }*/
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
            lights:true,
            fog: true
        });

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

    function initPlanets() {
		
        //var moonGeometry = new THREE.SphereGeometry( MOON_SIZE, 16, 16 );
        //var moonMaterial = new THREE.MeshLambertMaterial( {color: 0xcccccc} );

        var mercury = new Orbit3D(Ephemeris.mercury,
            {
              color: 0x913CEE, width: 1, jed: jed, object_size: 1.1,
              texture_path: opts.static_prefix + '/img/texture-mercury.jpg',
              display_color: new THREE.Color(0x913CEE),
              particle_geometry: particle_system_geometry,
              name: 'Mercury'
            }, !using_webgl);
        if (!using_webgl)
          scene.add(mercury.getParticle());

        //var mercuryMesh = new THREE.Mesh(planetGeometry, MercuryMaterial);

		var mercuryMesh = makeBodyMesh(MERCURY_SIZE, 'img/textures/mercury_small.jpg');
		addPlanet(mercury, mercuryMesh, nextEntityIndex, "Mercury");
        nextEntityIndex++;

        var venus = new Orbit3D(Ephemeris.venus,
            {
              color: 0xFF7733, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + '/img/texture-venus.jpg',
              display_color: new THREE.Color(0xFF7733),
              particle_geometry: particle_system_geometry,
              name: 'Venus'
            }, !using_webgl);

        //var venusMesh = new THREE.Mesh(planetGeometry, planetMaterial);

		var venusMesh = makeBodyMesh(VENUS_SIZE, 'img/textures/venus_small.jpg');
		addPlanet(venus, venusMesh, nextEntityIndex, "Venus");
        nextEntityIndex++;

        var earth = new Orbit3D(Ephemeris.earth,
            {
              color: 0x009ACD, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + '/img/texture-earth.jpg',
              display_color: new THREE.Color(0x009ACD),
              particle_geometry: particle_system_geometry,
              name: 'Earth'
            }, !using_webgl);

        //var earthMesh = new THREE.Mesh(planetGeometry, planetMaterial);
		var earthMesh = makeBodyMesh(EARTH_SIZE, 'img/textures/earth_small.jpg');
		addPlanet(earth, earthMesh, nextEntityIndex, "Earth");
        nextEntityIndex++;

        var luna = new Orbit3D(Ephemeris.luna,
            {
              color: 0x009ACD, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + '/img/texture-earth.jpg',
              display_color: new THREE.Color(0x009ACD),
              particle_geometry: particle_system_geometry,
              name: 'Moon'
            }, !using_webgl);
        var lunaMesh = makeBodyMesh(LUNA_SIZE, 'img/textures/moon_small.jpg');
		addMoon(earthMesh, luna, lunaMesh, nextEntityIndex, "Luna", "UNCLAIMED");
        nextEntityIndex ++;

        var mars = new Orbit3D(Ephemeris.mars,
            {
              color: 0xA63A3A, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + '/img/texture-mars.jpg',
              display_color: new THREE.Color(0xA63A3A),
              particle_geometry: particle_system_geometry,
              name: 'Mars'
            }, !using_webgl);

		var marsMesh = makeBodyMesh(MARS_SIZE, 'img/textures/mars_small.jpg');
		addPlanet(mars, marsMesh, nextEntityIndex, "Mars");
        nextEntityIndex++;


        var phobos = new Orbit3D(Ephemeris.phobos,
            {
              color: 0x009ACD, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + '/img/texture-earth.jpg',
              display_color: new THREE.Color(0x009ACD),
              particle_geometry: particle_system_geometry,
              name: 'Phobos'
            }, !using_webgl);
        var phobosMesh = makeBodyMesh(PHOBOS_SIZE, 'img/textures/phobos_tiny.jpg');
        addMoon(marsMesh, phobos, phobosMesh, nextEntityIndex, "Phobos", "UNCLAIMED");
        nextEntityIndex ++;


        var deimos = new Orbit3D(Ephemeris.deimos,
            {
              color: 0x009ACD, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + '/img/texture-earth.jpg',
              display_color: new THREE.Color(0x009ACD),
              particle_geometry: particle_system_geometry,
              name: 'Phobos'
            }, !using_webgl);
        var deimosMesh = makeBodyMesh(DEIMOS_SIZE, 'img/textures/deimos_tiny.jpg');
        addMoon(marsMesh, deimos, deimosMesh, nextEntityIndex, "Deimos", "UNCLAIMED");
        nextEntityIndex ++;




        var jupiter = new Orbit3D(Ephemeris.jupiter,
            {
              color: 0xFF7F50, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + '/img/texture-jupiter.jpg',
              display_color: new THREE.Color(0xFF7F50),
              particle_geometry: particle_system_geometry,
              name: 'Jupiter'
            }, !using_webgl);

        //var jupiterMesh = new THREE.Mesh(planetGeometry, planetMaterial);
		//var jupiterSize = 6;
		//orbit, size, texture
        var jupiterMesh = makeBodyMesh(JUPITER_SIZE, 'img/textures/jupiter_small.jpg');
		addPlanet(jupiter, jupiterMesh, nextEntityIndex, "Jupiter");
        nextEntityIndex++;


        var io = new Orbit3D(Ephemeris.io,
            {
              color: 0x009ACD, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + 'img/textures/moon_small.jpg',
              display_color: new THREE.Color(0x009ACD),
              particle_geometry: particle_system_geometry,
              name: 'Io'
            }, !using_webgl);
        var ioMesh = makeBodyMesh(IO_SIZE,'img/textures/moon_small.jpg');
        addMoon(jupiterMesh, io, ioMesh, nextEntityIndex, "Io", "UNCLAIMED");
        nextEntityIndex ++;

        var europa = new Orbit3D(Ephemeris.europa,
            {
              color: 0x009ACD, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + '/img/texture-earth.jpg',
              display_color: new THREE.Color(0x009ACD),
              particle_geometry: particle_system_geometry,
              name: 'Europa'
            }, !using_webgl);
        var europaMesh = makeBodyMesh(EUROPA_SIZE, 'img/textures/moon_small.jpg');
        addMoon(jupiterMesh, europa, europaMesh, nextEntityIndex, "Europa", "UNCLAIMED");
        nextEntityIndex ++;

        var ganymede = new Orbit3D(Ephemeris.ganymede,
            {
              color: 0x009ACD, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + '/img/texture-earth.jpg',
              display_color: new THREE.Color(0x009ACD),
              particle_geometry: particle_system_geometry,
              name: 'Ganymede'
            }, !using_webgl);
        var ganymedeMesh = makeBodyMesh(GANYMEDE_SIZE, 'img/textures/moon_small.jpg');
        addMoon(jupiterMesh, ganymede, ganymedeMesh, nextEntityIndex, "Ganymede", "UNCLAIMED");
        nextEntityIndex ++;

        var callisto = new Orbit3D(Ephemeris.callisto,
            {
              color: 0x009ACD, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + '/img/texture-earth.jpg',
              display_color: new THREE.Color(0x009ACD),
              particle_geometry: particle_system_geometry,
              name: 'Callisto'
            }, !using_webgl);
        var callistoMesh = makeBodyMesh(CALLISTO_SIZE, 'img/textures/moon_small.jpg');
        addMoon(jupiterMesh, callisto, callistoMesh, nextEntityIndex, "Callisto", "UNCLAIMED");
        nextEntityIndex ++;

    }

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

        // Remove Button
        $('#body-info-container').append("<div id='destroy-object-container'><br>" +
            "<h3>" +
            "<a id='destroy-object-button' href='#' style='color: red'>Remove this object</a>" +
            "</h3 >" +
            "</div>");
        $('#destroy-object-container').hide();

        $('#destroy-object-button').on('click', requestRemoveBody);
    }

    function animate() {
        requestAnimationFrame(animate);

        update(clock.getDelta());
        animateSun();

        render();
        stats.update();
        controls.update();
        // ensure origin target keeps ellipse displayed
        if (cameraTarget != undefined) {
            if (cameraTarget.orbit != undefined) cameraTarget.orbit.getEllipse().visible = true;
        }
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
        ws.send(message('claim',selectedObject));
        
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