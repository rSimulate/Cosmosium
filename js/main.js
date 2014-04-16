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

    var SHOWING_ASTEROID_OWNERSHIP = (typeof owners === "object");

    var CAMERA_NEAR = 1;
    var CAMERA_FAR = 100000;

    // orbits and meshes should have same length
    var orbits = [];
    var meshes = [];
    var ellipses = [];

    // for each type of object, there is a list of indexes of orbits/meshes that match it
    // example: indexes["asteroid"] --> [2,3,5] and you can get the orbits at orbits[2], orbits[3], orbits[5]
    var indexes = {
        "asteroid": [],
        "planet": [],
        "moon" : []
    };
    var mapFromMeshIdToBodyId = {};   // maps ids of three.js meshes to bodies they represent
    var nextEntityIndex = 0;

    var mapFromOwnerNameToColor = {};

function RSimulate(opts) {

  

    function addBody( parent, indexLabel, orbit, mesh, shouldAlwaysShowEllipse ) {
        shouldAlwaysShowEllipse = typeof shouldAlwaysShowEllipse !== 'undefined' ? shouldAlwaysShowEllipse : true;

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

	function makeBodyMesh(size, texture){
		var bodyGeometry = new THREE.SphereGeometry( size, 32, 32 );
		var bodyTexture = THREE.ImageUtils.loadTexture(texture);
		var bodyMaterial = new THREE.MeshLambertMaterial({ map: bodyTexture });
		
		var bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
		//addBody( scene, "planet", orbit, planetmesh, true );
		return bodyMesh;
	}
	
    function addPlanet(orbit, planetmesh) {
		addBody( scene, "planet", orbit, planetmesh, true );
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
        for (var key in orbit.eph) {
            infoHTML += "<p><b>" + key + "</b>: " + orbit.eph[key] + "</p>";
        }

        // TODO: make this display the owner name...       
        if (SHOWING_ASTEROID_OWNERSHIP) {

            var ownerName = owners[bodyId]; // asteroid[i] is owned by owner[i]
            if (ownerName) {
                var ownerColor = mapFromOwnerNameToColor[ownerName];

                console.log('claimed by "'+ownerName+'", color=('+ownerColor.b+','+ownerColor.g+','+ownerColor.r+')')
               
            }  
        }
        
        $("#body-info").html(infoHTML);

        $("#claim-asteroid-button").attr("href", ":7099/addAsteroid?name=" + bodyName);

        $("#body-info-container").show();

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

        clock = new THREE.Clock();
        clock.start();
        
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
              particle_geometry: particle_system_geometry // will add itself to this geometry
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
		var sunTexture = THREE.ImageUtils.loadTexture('img/textures/sun_small.jpg');
        var sunMaterial = new THREE.MeshPhongMaterial( {
			color: '#FFFFCC',
			specular: '#FFFF99',
			emissive: '#FFAD33',
			map: sunTexture,
			shininess: 100 
		});
        var sun = new THREE.Mesh( sphereGeometry, sunMaterial );
		scene.add(sun);
		
		//Create SunFlare
        //var sunflare = lensFlare(0,0,0, SUN_SIZE*1.05, 'img/textures/lensflare0.png');
		
    }

    function initPlanets() {

        //var planetGeometry = new THREE.SphereGeometry( PLANET_SIZE, 32, 32 );
        //var planetMaterial = new THREE.MeshLambertMaterial( {color: 0x0000ff} );
		//var MercuryMaterial = new THREE.MeshLambertMaterial( {color: 0x913CEE} );
		
        var moonGeometry = new THREE.SphereGeometry( MOON_SIZE, 16, 16 );
        var moonMaterial = new THREE.MeshLambertMaterial( {color: 0xcccccc} );

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

    function animate() {
        requestAnimationFrame(animate);

        update(clock.getDelta());

        render();
        stats.update();
    }

    function render() {
        renderer.render( scene, camera );
    }

    init();
    animate();
};


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

$(document).ready(function(){
    $("#body-info-container").hide();
});

var rSimulate = new RSimulate({});

