if ( ! Detector.webgl ) Detector.addGetWebGLMessage();





function RSimulate(opts) {
    var jed = toJED(new Date());    // julian date

    var jed_delta = 1;  // how many days per second to elapse
    
    var SUN_SIZE = 5;
    var ASTEROID_SIZE = 1;

    var particle_system_geometry = null;
    var using_webgl = true;
    var NUM_BIG_PARTICLES = 500;

    var container, stats;

    var camera, controls, scene, renderer;
    var clock;

    var planetOrbits = [];
    var planetMeshes = [];
    var asteroidOrbits = [];
    var asteroidMeshes = [];

    function init() {

        initCamera();

        scene = new THREE.Scene();

        // world

        initGeometry();


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

        var geometry = new THREE.SphereGeometry( ASTEROID_SIZE, 16, 16 );
        var material =  new THREE.MeshLambertMaterial( { color:0xffffff, shading: THREE.FlatShading } );

        for ( var i = 0; i < 500; i ++ ) {

            

        }

        var asteroidsData;
        $.getJSON ('localHost:8080/getObjects',function(json){
            asteroidsData = json;
        });
        
        //var asteroidsData = TestAsteroids;

        var numAsteroids = asteroidsData.length;
        console.log("num asteroids: " + numAsteroids);

        var useBigParticles = !using_webgl;

        var numAsteroidOrbitsShown = NUM_BIG_PARTICLES;

        if (numAsteroidOrbitsShown > numAsteroids) {
            numAsteroidOrbitsShown = numAsteroids;
        }

        for (var i = 0; i < numAsteroidOrbitsShown; i++) {
            var asteroid = asteroidsData[i];
            var display_color = i < NUM_BIG_PARTICLES ? opts.top_object_color : displayColorForObject(asteroid)
            
            var asteroidOrbit = new Orbit3D(asteroid, {
              color: 0xcccccc,
              display_color: display_color,
              width: 2,
              object_size: i < NUM_BIG_PARTICLES ? 50 : 15, //1.5,
              jed: jed,
              particle_geometry: particle_system_geometry // will add itself to this geometry
            }, useBigParticles);

            asteroidOrbits.push(asteroidOrbit);

            //scene.add(asteroidOrbit.getEllipse());

            var asteroidMesh = new THREE.Mesh( geometry, material );
            asteroidMesh.matrixAutoUpdate = false;
            scene.add( asteroidMesh );

            asteroidMeshes.push(asteroidMesh);
        }
    }

    function initSun() {
        var sphereGeometry = new THREE.SphereGeometry( SUN_SIZE, 32, 32 );
        var sunMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        var sun = new THREE.Mesh( sphereGeometry, sunMaterial );
        scene.add(sun);
    }

    function initPlanets() {
        var mercury = new Orbit3D(Ephemeris.mercury,
            {
              color: 0x913CEE, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + '/img/texture-mercury.jpg',
              display_color: new THREE.Color(0x913CEE),
              particle_geometry: particle_system_geometry,
              name: 'Mercury'
            }, !using_webgl);
        scene.add(mercury.getEllipse());
        if (!using_webgl)
          scene.add(mercury.getParticle());
        var venus = new Orbit3D(Ephemeris.venus,
            {
              color: 0xFF7733, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + '/img/texture-venus.jpg',
              display_color: new THREE.Color(0xFF7733),
              particle_geometry: particle_system_geometry,
              name: 'Venus'
            }, !using_webgl);
        scene.add(venus.getEllipse());
        if (!using_webgl)
          scene.add(venus.getParticle());
        var earth = new Orbit3D(Ephemeris.earth,
            {
              color: 0x009ACD, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + '/img/texture-earth.jpg',
              display_color: new THREE.Color(0x009ACD),
              particle_geometry: particle_system_geometry,
              name: 'Earth'
            }, !using_webgl);
        scene.add(earth.getEllipse());
        if (!using_webgl)
          scene.add(earth.getParticle());
        /*
        feature_map['earth'] = {
          orbit: earth,
          idx: 2
        };
        */
        var mars = new Orbit3D(Ephemeris.mars,
            {
              color: 0xA63A3A, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + '/img/texture-mars.jpg',
              display_color: new THREE.Color(0xA63A3A),
              particle_geometry: particle_system_geometry,
              name: 'Mars'
            }, !using_webgl);
        scene.add(mars.getEllipse());
        if (!using_webgl)
          scene.add(mars.getParticle());
        var jupiter = new Orbit3D(Ephemeris.jupiter,
            {
              color: 0xFF7F50, width: 1, jed: jed, object_size: 1.7,
              texture_path: opts.static_prefix + '/img/texture-jupiter.jpg',
              display_color: new THREE.Color(0xFF7F50),
              particle_geometry: particle_system_geometry,
              name: 'Jupiter'
            }, !using_webgl);
        scene.add(jupiter.getEllipse());
        if (!using_webgl)
          scene.add(jupiter.getParticle());

        planetOrbits = [mercury, venus, earth, mars, jupiter];
    }

    function initCamera() {
        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
        camera.position.z = 500;

        controls = new THREE.OrbitControls( camera );
        controls.addEventListener( 'change', render );
    }

    function initLights() {
        light = new THREE.PointLight( 0xffffff, 2, 1000);
        light.position.set(0,0,0);  // sun
        scene.add(light);

        /*
        light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 1, 1, 1 );
        scene.add( light );

        light = new THREE.DirectionalLight( 0x002288 );
        light.position.set( -1, -1, -1 );
        scene.add( light );
        */

        light = new THREE.AmbientLight( 0x222222 );
        scene.add( light );
    }

    function initRenderer() {
        renderer = new THREE.WebGLRenderer( { antialias: false } );
        renderer.setSize( window.innerWidth, window.innerHeight );

        container = document.getElementById( 'container' );
        container.appendChild( renderer.domElement );
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
        jed += jed_delta*deltaSeconds;

        for (var i = 0; i < asteroidOrbits.length; i++) {
            var asteroidOrbit = asteroidOrbits[i];

            var helioCoords = asteroidOrbit.getPosAtTime(jed);

            var asteroidMesh = asteroidMeshes[i];
            asteroidMesh.position.set(helioCoords[0], helioCoords[1], helioCoords[2]);
            asteroidMesh.updateMatrix();
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



var rSimulate = new RSimulate({});