if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

  var jed = toJED(new Date());    // julian date

    var jed_delta = 5;  // how many days per second to elapse
    
    // NOTE: relative scale (exaggeration) parameters now in ephemeris.js

    var particle_system_geometry = null;
    var using_webgl = true;
    var NUM_BIG_PARTICLES = 500;

    var container, stats;

    var camera, controls, scene, renderer;
    var mouse = new THREE.Vector2();
    var offset = new THREE.Vector3();
    var SELECTED;
    var INTERSECTED;
    var projector;
    var clock;
    var plane;
    var skybox;
    var sun;

    //var addButt = document.getElementById('add-object-button');
    // TODO: removeButt element is null on run-time when trying to attach listener
    var removeButt = document.getElementById('remove-object-button');
    var claimButt = document.getElementById('claim-asteroid-button');
    
    var SHOWING_ASTEROID_OWNERSHIP = (typeof owners === "object");
    var SHOWING_ASTEROID_CLAIM = !(claimButt == null);
    
    var CAMERA_NEAR = 1;
    var CAMERA_FAR = 100000;

    // orbits and meshes should have same length
    var orbits = [];
    var meshes = [];
    var ellipses = [];
    var playerObjects = [];

    // for each type of object, there is a list of indexes of orbits/meshes that match it
    // example: indexes["asteroid"] --> [2,3,5] and you can get the orbits at orbits[2], orbits[3], orbits[5]
    var indexes = {
        "asteroid": [],
        "planet": [],
        "moon" : [],
        "playerObject": []
    };
    var mapFromMeshIdToBodyId = {};   // maps ids of three.js meshes to bodies they represent
    var nextEntityIndex = 0;

    var mapFromOwnerNameToColor = {};
    
    var selectedBody = '';

function RSimulate(opts) {

  

    function addBody( parent, indexLabel, orbit, mesh, shouldAlwaysShowEllipse ) {
        shouldAlwaysShowEllipse = typeof shouldAlwaysShowEllipse !== 'undefined' ? shouldAlwaysShowEllipse : true;
        console.log(orbit.name);
        orbits.push(orbit);
        meshes.push(mesh);
        mapFromMeshIdToBodyId[mesh.id] = nextEntityIndex;
        parent.add(mesh);

        var ellipse = orbit.getEllipse();

        ellipses.push(ellipse);
        parent.add(ellipse);
        ellipse.visible = shouldAlwaysShowEllipse;

        if (typeof indexes[indexLabel] !== "object") {
            indexes[indexLabel] = [];
        }

        indexes[indexLabel].push(nextEntityIndex);
        
        nextEntityIndex++;
    }
    function removePlayerBody() {
        removeBody(undefined, undefined, undefined);
    }

    function removeBody (parentScene, indexLabel, playerObject) {
        if (indexLabel == undefined) { indexLabel = "playerObject"; }
        if (parentScene == undefined) { parentScene = scene; }
        if (playerObject == undefined) { playerObject = selectedBody; }
        for (var index in orbits) {
            if (orbits[index].hasOwnProperty('name')) {
                if (orbits[index].name == playerObject.orbit.name) {
                    orbits.splice(index, 1);
                    break;
                }
            }
        }
        for (index in meshes) {
            if (meshes[index] == playerObject.mesh) {
                meshes.splice(index, 1);
                break;
            }
        }

        parentScene.remove(playerObject.mesh);

        var ellipse = playerObject.orbit.getEllipse();
        for (index in ellipses) {
            if (ellipses[index] == ellipse) {
                ellipses.splice(index, 1);
                break;
            }
        }

        parentScene.remove(ellipse);


        var bodyId = mapFromMeshIdToBodyId[playerObject.mesh];

        for (index in indexes[indexLabel]) {
            if (indexes[indexLabel][index] == bodyId) {
                indexes[indexLabel].splice(index, 1);
                //nextEntityIndex--;
                break;
            }
        }
    }

	function makeBodyMesh(size, texture){
		var bodyGeometry = new THREE.SphereGeometry( size, 32, 32 );
		var bodyTexture = THREE.ImageUtils.loadTexture(texture);
		var bodyMaterial = new THREE.MeshLambertMaterial({ map: bodyTexture });
		
		var bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);

		return bodyMesh;
	}
	
    function addPlanet(orbit, planetmesh) {
		addBody( scene, "planet", orbit, planetmesh, true );
    }

    function addPlayerObject(orbit, mesh) {
        addBody( scene, "playerObject", orbit, mesh, true);
    }

    function addAsteroid(orbit, mesh) {
        addBody( scene, "asteroid", orbit, mesh, false );
    }

    function addMoon(planetMesh, orbit, mesh) {
        addBody( planetMesh, "moon", orbit, mesh, false );
    }

    function onDocumentMouseMove( event ) {

        event.preventDefault();

        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        //

        var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
        projector.unprojectVector( vector, camera );

        var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );


        if ( SELECTED ) {

            var intersects = raycaster.intersectObject( plane );
            SELECTED.position.copy( intersects[ 0 ].point.sub( offset ) );
            return;

        }


        var intersects = raycaster.intersectObjects( meshes );

        if ( intersects.length > 0 ) {

            if ( INTERSECTED != intersects[ 0 ].object ) {

                //if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

                INTERSECTED = intersects[ 0 ].object;
                //INTERSECTED.currentHex = INTERSECTED.material.color.getHex();

                plane.position.copy( INTERSECTED.position );
                plane.lookAt( camera.position );

            }

            container.style.cursor = 'pointer';

        } else {

            //if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

            INTERSECTED = null;

            container.style.cursor = 'auto';

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

    function hideAllAsteroidEllipses() {
        for (var i = 0; i < indexes["asteroid"].length; i++) {
            ellipses[indexes["asteroid"][i]].visible = false;
        }
    }

    function onBodySelected(bodyId) {
        console.log("onBodySelected(" + bodyId + ")");

        hideAllAsteroidEllipses();

        var orbit = orbits[bodyId];
        var mesh = meshes[bodyId];
        var ellipse = ellipses[bodyId];
        ellipse.visible = true;
        var bodyName = "";

        console.log("\torbit: ");
        console.log(orbit);
        if (orbit && orbit.eph && orbit.eph.full_name) {
            bodyName = orbit.eph.full_name;
        } else if (orbit && orbit.name) {
            bodyName = orbit.name;
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

            var ownerName = owners[bodyId - 12]; // asteroid[i] is owned by owner[i], there are 12 non-asteroid objects in the system...
            if (ownerName) {
                var ownerColor = mapFromOwnerNameToColor[ownerName];
                console.log('claimed by "' + ownerName + '", color=(' + ownerColor.b + ',' + ownerColor.g + ',' + ownerColor.r + ')');
                $("#owner-info").html('claimed by <b>"' + ownerName + '"</b>');
                $("#owner-info").attr("color", "rgb(" + ownerColor.r + ',' + ownerColor.g + ',' + ownerColor.b + ')');  //NOTE: this doesn't seem to work.
            } else {
                $("#owner-info").html('<b>UNCLAIMED</b>');
                $("#owner-info").attr("color", 'rgb(200,200,200)');   //NOTE: this doesn't seem to work.
            }
        }
        if (bodyName.toLocaleLowerCase().search("player") !== -1) {
            $("#player-body-info").html(infoHTML);
            $("#player-body-info-container").show();
        }
        else {
            $("#body-info").html(infoHTML);
            $("#body-info-container").show();
        }

        selectedBody = bodyName;


        console.log("\t" + bodyName);
        console.log("\tmesh: ");
        console.log(mesh);
    }

    function onDocumentMouseDown( event ) {
        event.preventDefault();

        var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
        projector.unprojectVector( vector, camera );

        var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

        var intersects = raycaster.intersectObjects( meshes );

        if ( intersects.length > 0 ) {

            controls.enabled = false;

            SELECTED = intersects[ 0 ].object;
            var intersects = raycaster.intersectObject( plane );
            offset.copy( intersects[ 0 ].point ).sub( plane.position );

            var meshId = SELECTED.id;
            var bodyId = mapFromMeshIdToBodyId[meshId];
            if (bodyId) {
                onBodySelected(bodyId);
            } else {
                console.log("no body id found for meshId = " + meshId);
            }

        } else {

            hideAllAsteroidEllipses();

            SELECTED = null;
            onBodyDeselected();
        }
    }

    function onDocumentMouseUp( event ) {

        event.preventDefault();

        controls.enabled = true;

        if ( INTERSECTED ) {

            plane.position.copy( INTERSECTED.position );

            SELECTED = null;
        }

        container.style.cursor = 'auto';

    }

    function onBodyDeselected() {
        $("#body-info-container").hide();
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

        initAsteroids();
    }

    function initAsteroids() {
        console.log("initAsteroids");

        var geometry = new THREE.SphereGeometry( 1, 16, 16 );
        

        var lambertShader = THREE.ShaderLib['lambert'];
        var basicShader = THREE.ShaderLib['basic'];

        //var vertexShaderText = lambertShader.vertexShader;
        var vertexShaderText = document.getElementById("asteroid-vertex").textContent;
        var fragmentShaderText;

        var asteroidsData = TestAsteroids;
        //var asteroidsData += OOIs[0];
        console.log(asteroidsData);

        var numAsteroids = asteroidsData.length;
        console.log("num asteroids: " + numAsteroids);

        var useBigParticles = !using_webgl;

        var numAsteroidOrbitsShown = NUM_BIG_PARTICLES;

        if (numAsteroidOrbitsShown > numAsteroids) {
            numAsteroidOrbitsShown = numAsteroids;
        }

        // first iterate and find the range of values for magnitude (H)
        var minH;
        var maxH;
        var sumH = 0;
        var countH = 0;

        for (var i = 0; i < numAsteroidOrbitsShown; i++) {
            var asteroid = asteroidsData[i];
            if (asteroid.H && asteroid.diameter != "") {
                if (minH && maxH) {
                    if (minH > asteroid.H) { minH = asteroid.H };
                    if (maxH < asteroid.H) { maxH = asteroid.H };
                } else {
                    minH = asteroid.H;
                    maxH = asteroid.H;
                }

                sumH += asteroid.H;
                countH ++;
            }
        }

        for (var i = 0; i < numAsteroidOrbitsShown; i++) {
            fragmentShaderText = lambertShader.fragmentShader;

            var uniforms = THREE.UniformsUtils.clone(lambertShader.uniforms);

            var asteroid = asteroidsData[i];

            var baseAsteroidSize = ASTEROID_SIZE;
            if (asteroid.diameter && asteroid.diameter !== "") {
                baseAsteroidSize *= (asteroid.diameter/100.0);
            }

            if (asteroid.H && asteroid.H !== "") {  // magnitude
                var percentageDark = (asteroid.H - minH) / (maxH - minH);
                uniforms.diffuse.value = new THREE.Color(percentageDark, percentageDark, percentageDark);                
            }

            // color asteroids based on ownership
            if (SHOWING_ASTEROID_OWNERSHIP) {

                var ownerName = owners[i]; // asteroid[i] is owned by owner[i]
                if (ownerName) {
                    var ownerColor = mapFromOwnerNameToColor[ownerName];

                    fragmentShaderText = basicShader.fragmentShader;

                    uniforms.diffuse.value = ownerColor;              
                }  
            }

            var display_color = i < NUM_BIG_PARTICLES ? opts.top_object_color : displayColorForObject(asteroid)
            
            var asteroidOrbit = new Orbit3D(asteroid, {
              color: 0xcccccc,
              display_color: display_color,
              width: 2,
              object_size: i < NUM_BIG_PARTICLES ? 50 : 15, //1.5,
              jed: jed,
              particle_geometry: particle_system_geometry, // will add itself to this geometry
              name: "asteroid"
            }, useBigParticles);

            var material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: vertexShaderText,
                fragmentShader: fragmentShaderText,
                lights:true,
                fog: true
            });

            var asteroidMesh = new THREE.Mesh( geometry, material );

            // randomize the shape a tiny bit
            asteroidMesh.scale.set(
                baseAsteroidSize * (Math.random() + 0.5),
                baseAsteroidSize * (Math.random() + 0.5),
                baseAsteroidSize * (Math.random() + 0.5));

            // give the asteroids a little random initial rotation so they don't look like eggs standing on end
            asteroidMesh.rotation.set(
                Math.random() * 2.0 * Math.PI,
                Math.random() * 2.0 * Math.PI,
                Math.random() * 2.0 * Math.PI);

            addAsteroid(asteroidOrbit, asteroidMesh);



        }
    }

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
		scene.add(sun);
		
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
		addPlanet(mercury, mercuryMesh);

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
		addPlanet(venus, venusMesh);

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
		addPlanet(earth, earthMesh);

        var luna = new Orbit3D(Ephemeris.luna,
            {
              color: 0x009ACD, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + '/img/texture-earth.jpg',
              display_color: new THREE.Color(0x009ACD),
              particle_geometry: particle_system_geometry,
              name: 'Moon'
            }, !using_webgl);
        var lunaMesh = makeBodyMesh(LUNA_SIZE, 'img/textures/moon_small.jpg');
		addMoon(earthMesh, luna, lunaMesh);


        var mars = new Orbit3D(Ephemeris.mars,
            {
              color: 0xA63A3A, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + '/img/texture-mars.jpg',
              display_color: new THREE.Color(0xA63A3A),
              particle_geometry: particle_system_geometry,
              name: 'Mars'
            }, !using_webgl);

        //var marsMesh = new THREE.Mesh(planetGeometry, planetMaterial);
        //addPlanet(mars, marsMesh);
		//var marsSize = 0.9;
		//orbit, size, texture
		var marsMesh = makeBodyMesh(MARS_SIZE, 'img/textures/mars_small.jpg');
		addPlanet(mars, marsMesh);


        var phobos = new Orbit3D(Ephemeris.phobos,
            {
              color: 0x009ACD, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + '/img/texture-earth.jpg',
              display_color: new THREE.Color(0x009ACD),
              particle_geometry: particle_system_geometry,
              name: 'Phobos'
            }, !using_webgl);
        var phobosMesh = makeBodyMesh(PHOBOS_SIZE, 'img/textures/phobos_tiny.jpg');
        addMoon(marsMesh, phobos, phobosMesh);


        var deimos = new Orbit3D(Ephemeris.deimos,
            {
              color: 0x009ACD, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + '/img/texture-earth.jpg',
              display_color: new THREE.Color(0x009ACD),
              particle_geometry: particle_system_geometry,
              name: 'Phobos'
            }, !using_webgl);
        var deimosMesh = makeBodyMesh(DEIMOS_SIZE, 'img/textures/deimos_tiny.jpg');
        addMoon(marsMesh, deimos, deimosMesh);




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
		addPlanet(jupiter, jupiterMesh);


        var io = new Orbit3D(Ephemeris.io,
            {
              color: 0x009ACD, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + 'img/textures/moon_small.jpg',
              display_color: new THREE.Color(0x009ACD),
              particle_geometry: particle_system_geometry,
              name: 'Io'
            }, !using_webgl);
        var ioMesh = makeBodyMesh(IO_SIZE,'img/textures/moon_small.jpg');
        addMoon(jupiterMesh, io, ioMesh);

        var europa = new Orbit3D(Ephemeris.europa,
            {
              color: 0x009ACD, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + '/img/texture-earth.jpg',
              display_color: new THREE.Color(0x009ACD),
              particle_geometry: particle_system_geometry,
              name: 'Europa'
            }, !using_webgl);
        var europaMesh = makeBodyMesh(EUROPA_SIZE, 'img/textures/moon_small.jpg');
        addMoon(jupiterMesh, europa, europaMesh);

        var ganymede = new Orbit3D(Ephemeris.ganymede,
            {
              color: 0x009ACD, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + '/img/texture-earth.jpg',
              display_color: new THREE.Color(0x009ACD),
              particle_geometry: particle_system_geometry,
              name: 'Ganymede'
            }, !using_webgl);
        var ganymedeMesh = makeBodyMesh(GANYMEDE_SIZE, 'img/textures/moon_small.jpg');
        addMoon(jupiterMesh, ganymede, ganymedeMesh);

        var callisto = new Orbit3D(Ephemeris.callisto,
            {
              color: 0x009ACD, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + '/img/texture-earth.jpg',
              display_color: new THREE.Color(0x009ACD),
              particle_geometry: particle_system_geometry,
              name: 'Callisto'
            }, !using_webgl);
        var callistoMesh = makeBodyMesh(CALLISTO_SIZE, 'img/textures/moon_small.jpg');
        addMoon(jupiterMesh, callisto, callistoMesh);

    }

    function initCamera() {
        
        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, CAMERA_NEAR, CAMERA_FAR );
        camera.position.z = 500;

        controls = new THREE.OrbitControls( camera );
        controls.addEventListener( 'change', render );
    }

    function initLights() {
        light = new THREE.PointLight( 0xffffff, 2, 10000);
        light.position.set(0,0,0);  // sun
        scene.add(light);

        light = new THREE.AmbientLight( 0x222222 );
        scene.add( light );
    }

    function initRenderer() {
        plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
        plane.visible = false;
        scene.add( plane );

        projector = new THREE.Projector();

        renderer = new THREE.WebGLRenderer( { antialias: false } );
        renderer.setSize( window.innerWidth, window.innerHeight );

        container = document.getElementById( 'container' );
        container.appendChild( renderer.domElement );

        renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
        renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
        renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
    }

    function initStats() {
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        stats.domElement.style.zIndex = 100;
        container.appendChild( stats.domElement );
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

        render();
    }

    function update(deltaSeconds) {
        var timeAdvanced = jed_delta*deltaSeconds;
        jed += jed_delta*deltaSeconds;


        updateBodies(timeAdvanced, orbits, meshes);
    }

    function updateBodies(timeAdvanced, orbits, meshes) {
        for (var i = 0; i < orbits.length; i++) {
            var orbit = orbits[i];
  
            var helioCoords = orbit.getPosAtTime(jed);
  
            var mesh = meshes[i];
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

    function addTestObject() {
        /*var ephemerisExample = {"sigma_tp": 2.5317e-05, "rms": 0.53248, "epoch_mjd": 56800.0, "ad": 1.415843073989676,
            "producer": "Otto Matic", "closeness": 5790.655335318724, "prov_des": "1999 JU3", "tp": 2456850.0304208165,
            "saved": -79283961669.67264, "id": "a0162173", "moid_ld": 0.0453616552, "neo": "Y",
            "profit": 34519804034.69253, "sigma_q": 3.7997e-08, "sigma_w": 4.4991e-05, "epoch": 2456800.5,
            "per": 473.8619484817272, "n_obs_used": 622.0, "data_arc": 9567.0, "sigma_i": 2.7705e-06,
            "score": 289.55276676593616, "per_y": 1.29736330864265, "sigma_n": 3.1303e-09, "epoch_cal": 20140523.0,
            "orbit_id": "JPL 101", "sigma_a": 3.2675e-09, "sigma_om": 4.0452e-05, "price": 95016780624.57524,
            "sigma_e": 3.2029e-08, "condition_code": 0.0, "a": 1.189512305967212, "n": 0.7597149362877829,
            "last_obs": "2012-06-23", "H": 19.2, "pha": "Y", "spkid": 2162173.0, "tp_cal": 20140711.5304208,
            "first_obs": "1986-04-14", "moid": 0.00011656, "spec_B": "Cg", "ma": 322.3709995051157, "pdes": 162173.0,
            "class": "APO", "rot_per": 7.627, "t_jup": 5.308, "om": 251.6143045194225, "e": 0.1902719012548845,
            "i": 5.883964051447641, "spec": "Cg", "q": 0.963181537944749, "w": 211.4370351822665,
            "sigma_ma": 1.9187e-05, "dv": 4.663854, "est_diameter": 0.4959973445799733};*/

        var ephemeris = {"per": 473.8619484817272, "e": 0.302719012548845};

        var orbit = new Orbit3D(ephemeris,
            {
                color: 0xff0000, width: 1, jed: jed, object_size: 1.7,
                texture_path: opts.static_prefix + '/img/texture-earth.jpg',
                display_color: new THREE.Color(0xff0000),
                particle_geometry: particle_system_geometry,
                name: 'Player Terraformed Planet ' + playerObjects.length
            }, !using_webgl);

        //var earthMesh = new THREE.Mesh(planetGeometry, planetMaterial);
        var earthMesh = makeBodyMesh(EARTH_SIZE, 'img/textures/earth_small.jpg');

        addPlayerObject(orbit, earthMesh);
        playerObjects.push({mesh: earthMesh, orbit: orbit});
    }

    function initUI() {
        //addButt = document.getElementById('add-object-button');
        //addButt.addEventListener('click', addTestObject(), false);
        removeButt.addEventListener('click', removePlayerBody, false);
        addTestObject();
    }

    function animate() {
        requestAnimationFrame(animate);

        update(clock.getDelta());
        animateSun();

        render();
        stats.update();
    }

    function render() {
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
        
        // this doesn't work...
        //$('#content').load('/content/addAsteroid?name='+bodyName);
        // so we'll have to use websockets instead:
        ws.send(message('track',selectedBody));
        
    }
    claimButt.addEventListener('click', claimButt_onClick, false);
}
    
$(document).ready(function(){
    $("#body-info-container").hide();
});

var rSimulate = new RSimulate({});

