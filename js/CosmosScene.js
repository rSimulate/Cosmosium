

var CosmosScene = function (cosmosUI) {
    var _this = this;
    var NUM_BIG_PARTICLES = 500;
    var particle_system_geometry = null;

    var LOD_DIST = {ONE: 300, TWO: 600, THREE: 1000};
    var objects = []; // {owner: owner, objectId: objectId, type: type, model: model, orbit: orbit, mesh: mesh, parent: scene}
    var players = []; // {player: playerName, color: THREE.Color}
    var scene = new THREE.Scene();
    var cosmosRender;
    var selectedObject;

    this.init = function(_cosmosRender) {
        cosmosRender = _cosmosRender;
        initLights();
        initSkybox(cosmosRender.getMaxCullDist());
        initSun();
    };

    function initLights() {
        var light = new THREE.PointLight( 0xffffff, 2, 10000);
        light.position.set(0,0,0);  // sun
        scene.add(light);

        light = new THREE.AmbientLight( 0x222222 );
        scene.add( light );
    }

    function initSkybox(cullDist) {
        var geometry = new THREE.SphereGeometry(cullDist / 2.0, 60, 40);

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

        var skybox = new THREE.Mesh(geometry, material);
        skybox.scale.set(-1, 1, 1);
        skybox.eulerOrder = 'XZY';
        skybox.rotation.z = Math.PI/3.0;
        skybox.rotation.x = Math.PI;
        skybox.renderDepth = 1000.0;
        scene.add(skybox);
    }

    function initSun() {
        //Create Sun Model
        var sphereGeometry = new THREE.SphereGeometry( SUN_SIZE, 32, 32 );
        //var sunTexture = THREE.ImageUtils.loadTexture('img/textures/sun_small.jpg');
        var time = cosmosRender.getClock().getElapsedTime();
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

        var sun = new THREE.Mesh( sphereGeometry, sunMaterial );
        _this.addBody(scene, 'star', undefined, sun, false, 1, "Sun", "Mankind");
    }

    this.getPlayers = function () {return players;};
    this.getParticleSystemGeometry = function () {return particle_system_geometry;};

    this.addBody = function( parent, type, orbit, mesh, shouldAlwaysShowEllipse, objectId, model, owner ) {
        shouldAlwaysShowEllipse = typeof shouldAlwaysShowEllipse !== 'undefined' ? shouldAlwaysShowEllipse : true;

        // orbit undefined for sun
        if (orbit != undefined) {
            // check if the object is already in the scene
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
        obj.parent = parent;
        objects.push(obj);

        // orbit sun at start of game
        if (obj.model == 'Sun') {
            this.sun = obj;
        }

        if (type == 'playerObject') {
            // add to player object div
            cosmosUI.addPlayerObject(obj);
        }
        parent.add(mesh);
    };

    this.requestRemoveBody = function (e) {
        console.log("Called for removal of objectID " + selectedObject.objectId);
        ws.send(message('playerObject',"{'data': {'cmd': 'destroy', 'uuid': '" + selectedObject.objectId + "'}}"));
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

    this.removeEllipse = function(parentScene, ellipse) {
        "use strict";

        if (parentScene == undefined) { parentScene = scene; }
        parentScene.remove(ellipse);
    };

    this.getWorldPos = function (mesh) {
        "use strict";
        var vector = new THREE.Vector3();
        return vector.setFromMatrixPosition(mesh.matrixWorld);
    };

    this.detachObject = function (object) {
        "use strict";
        // removes object from moon or other orbital body if parent is not scene
        if (object.orbit) {_this.removeEllipse(object.parent.mesh, object.orbit.getEllipse());}

        if (!object.parent instanceof THREE.Scene) {
            THREE.SceneUtils.detach(object.mesh, object.parent.mesh, _this.getScene());
            object.parent = _this.getScene();
        }
    };

    this.attachObject = function (object, parent) {
        "use strict";
        // attaches object to a moon or other orbital body
        THREE.SceneUtils.attach(object.mesh, _this.getScene(), parent.mesh);
        object.parent = parent;

        if (object.orbit) {object.parent.mesh.add(object.orbit.getEllipse());}
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
            console.log("Error: Could not find object " + objectId + " to remove");
            return null;
        }

        parentScene.remove(rmObject.mesh);
        if (rmObject.orbit != undefined) parentScene.remove(rmObject.orbit.getEllipse());

        // remove div from player object list
        if (type == "playerObject") {
            $('#'+rmObject.orbit.name).remove();
        }
        cosmosRender.orbitCamera(this.getSolarCentricObject());
        // deselect body, if selected
        cosmosUI.onBodyDeselected();
    };

    this.makeBodyMesh = function(size, texture, normal){
        var bodyGeometry = new THREE.SphereGeometry( size, 32, 32 );
        var bodyTexture = THREE.ImageUtils.loadTexture(texture);
        var bodyMaterial = new THREE.MeshLambertMaterial({
            map: bodyTexture
        });

        if (normal != undefined) {
            var normalTexture = THREE.ImageUtils.loadTexture(normal);
            bodyMaterial = new THREE.MeshPhongMaterial({
                map: bodyTexture,
                normalMap: normalTexture
            });
        }

        return new THREE.Mesh(bodyGeometry, bodyMaterial);
    };

    this.hideAllConditionalEllipses = function () {
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            if (obj.type == 'asteroid') {
                obj.orbit.getEllipse().visible = false;
            }
        }
    };

    function getColorForOwner(owner) {
        for (var i = 0; i < players.length; i++) {
            var player = players[i];
            if (player.player == owner) return player.color;
        }
    }

    this.updateObjectOwnerById = function (newOwner, objectId) {
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

    this.addBlenderObjectMesh = function (daePath, object) {

        // object = {owner: owner, objectId: objectId, type: type, model: model, orbit: orbit, // ADDING mesh: mesh}

        var loader = new THREE.ColladaLoader();
        loader.options.convertUpAxis = true;

        // If you had animations, you would add to the second argument function below
        var obj3d;
        loader.load(daePath, function (collada) {
            obj3d = collada.scene;
            if (obj3d != undefined) {
                obj3d.scale.x = obj3d.scale.y = obj3d.scale.z = 1;
                obj3d.updateMatrix();
                obj3d.userData = {boundingBox: new THREE.Box3().setFromObject(obj3d)};

                // add to scene
                _this.addBody(scene, "playerObject", object.orbit, obj3d, true, object.objectId, object.model, object.owner);
            }
            else {console.log("ERROR: Parsing blender model failed");}
        });

    };

    this.addTestObject = function () {
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

    this.addAsteroid = function (orbit, mesh, objectId, model, owner) {
        _this.addBody( scene, "asteroid", orbit, mesh, false, objectId, model, owner );
    };

    this.addMoon = function (planetMesh, orbit, mesh, objectId, model, owner) {
        _this.addBody( planetMesh, "moon", orbit, mesh, false, objectId, model, owner  );
    };

    this.getScene = function () {return scene;};

    this.getSolarCentricObject = function () {
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
    };

    this.addNewAsteroid = function(asteroid) {

        var geometry = [
            [new THREE.SphereGeometry( 1, 6, 6 ), LOD_DIST.ONE],
            [new THREE.SphereGeometry( 1, 5, 5 ), LOD_DIST.TWO],
            [new THREE.SphereGeometry( 1, 4, 4 ), LOD_DIST.THREE]
        ];


        var lambertShader = THREE.ShaderLib['lambert'];
        var uniforms = THREE.UniformsUtils.clone(lambertShader.uniforms);
        uniforms.map.value = THREE.ImageUtils.loadTexture('img/textures/asteroid_small.jpg');

        var vertexShaderText = document.getElementById("asteroid-vertex").textContent;
        var fragmentShaderText = lambertShader.fragmentShader;

        var useBigParticles = !cosmosRender.isUsingWebGL();

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
            //TODO: not sure how the object_size needs to be configured
            object_size: 1 < NUM_BIG_PARTICLES ? 50 : 15, //1.5,
            jed: cosmosRender.getJED(),
            particle_geometry: particle_system_geometry, // will add itself to this geometry
            name: asteroid.orbit.full_name
        }, useBigParticles);

        var rot, scale;
        if (asteroid.orbit.full_name.indexOf('Ceres') >= 0) {
            geometry = [
                [new THREE.SphereGeometry( 1, 10, 10 ), LOD_DIST.ONE],
                [new THREE.SphereGeometry( 1, 8, 8 ), LOD_DIST.TWO],
                [new THREE.SphereGeometry( 1, 6, 6 ), LOD_DIST.THREE]
            ];
            vertexShaderText = lambertShader.vertexShader;
            scale = [baseAsteroidSize, baseAsteroidSize, baseAsteroidSize];
            rot = [0,0,0];
        }
        else if (asteroid.orbit.full_name.indexOf('Pallas') >= 0) {
            geometry = [
                [new THREE.SphereGeometry( 1, 10, 10 ), LOD_DIST.ONE],
                [new THREE.SphereGeometry( 1, 8, 8 ), LOD_DIST.TWO],
                [new THREE.SphereGeometry( 1, 6, 6 ), LOD_DIST.THREE]
            ];
            vertexShaderText = lambertShader.vertexShader;
            scale = [baseAsteroidSize + (Math.random() + 0.2), baseAsteroidSize, baseAsteroidSize];
            rot = [0,0,0];
        }
        else if (asteroid.orbit.full_name.indexOf('Vesta') >= 0) {
            geometry = [
                [new THREE.SphereGeometry( 1, 10, 10 ), LOD_DIST.ONE],
                [new THREE.SphereGeometry( 1, 8, 8 ), LOD_DIST.TWO],
                [new THREE.SphereGeometry( 1, 6, 6 ), LOD_DIST.THREE]
            ];
            vertexShaderText = lambertShader.vertexShader;
            scale = [baseAsteroidSize + (Math.random() + 0.5), baseAsteroidSize * (Math.random() + 0.7),
                baseAsteroidSize];
            rot = [0,0,0];
        }
        else if (asteroid.orbit.full_name.indexOf('Euphrosyne') >= 0) {
            geometry = [
                [new THREE.SphereGeometry( 1, 10, 10 ), LOD_DIST.ONE],
                [new THREE.SphereGeometry( 1, 8, 8 ), LOD_DIST.TWO],
                [new THREE.SphereGeometry( 1, 6, 6 ), LOD_DIST.THREE]
            ];
            vertexShaderText = lambertShader.vertexShader;
            scale = [baseAsteroidSize, baseAsteroidSize,
                baseAsteroidSize];
            rot = [0,0,0];
        }
        else {
            // randomize the shape a tiny bit
            scale = [baseAsteroidSize * (Math.random() + 0.5),
                    baseAsteroidSize * (Math.random() + 0.5),
                    baseAsteroidSize * (Math.random() + 0.5)];

            // give the asteroids a little random initial rotation so they don't look like eggs standing on end
            rot = [
                    Math.random() * 2.0 * Math.PI,
                    Math.random() * 2.0 * Math.PI,
                    Math.random() * 2.0 * Math.PI];
        }

        var material = new THREE.ShaderMaterial({
            defines: {'USE_NORMAL_MAP': true},
            uniforms: uniforms,
            vertexShader: vertexShaderText,
            fragmentShader: fragmentShaderText,
            fog: true,
            lights: true
        });
        material.map = true;

        var lod = new THREE.LOD();

        for (var i = 0; i < geometry.length; i++) {
            var asteroidMesh = new THREE.Mesh( geometry[i][0], material );

            asteroidMesh.scale.set(scale[0], scale[1], scale[2]);
            asteroidMesh.rotation.set(rot[0], rot[1], rot[2]);

            lod.addLevel( asteroidMesh, geometry[i][1]);
        }



        _this.addAsteroid(asteroidOrbit, lod, asteroid.objectId, asteroid.type, asteroid.owner);
    };

    this.addPlanet = function(planet) {
        //
        var mesh = undefined;
        var parent = scene;
        if (planet.type == 'planet') {
            if (planet.model == 'Mercury') {
                mesh = _this.makeBodyMesh(MERCURY_SIZE, 'img/textures/mercury_small.jpg',
                    'img/textures/mercury_small_normal.jpg');
            }
            else if (planet.model == 'Venus') {
                mesh = _this.makeBodyMesh(VENUS_SIZE, 'img/textures/venus_small.jpg', 'img/textures/venus_small_normal.jpg');
            }
            else if (planet.model == 'Earth') {
                mesh = _this.makeBodyMesh(EARTH_SIZE, 'img/textures/earth_small.jpg', 'img/textures/earth_small_normal.jpg');
            }
            else if (planet.model == 'Mars') {
                mesh = _this.makeBodyMesh(MARS_SIZE, 'img/textures/mars_small.jpg', 'img/textures/mars_small_normal.jpg');
            }
            else if (planet.model == 'Jupiter') {
                mesh = _this.makeBodyMesh(JUPITER_SIZE, 'img/textures/jupiter_small.jpg',
                    'img/textures/jupiter_small_normal.jpg');
            }
            else if (planet.model == 'Saturn') {
                mesh = _this.makeBodyMesh(SATURN_SIZE, 'img/textures/saturn_medium.jpg',
                    'img/textures/saturn_medium_normal.jpg');
                var ringMaterial = new THREE.MeshPhongMaterial({
                    ambient		: 0xFFFFFF,
                    color		: 0xDDDDDD,
                    shininess	: 150,
                    specular	: 0x000000,
                    shading		: THREE.SmoothShading,
                    map		    : THREE.ImageUtils.loadTexture('img/textures/saturn_rings_small.png'),
                    normalMap   : THREE.ImageUtils.loadTexture('img/textures/saturn_rings_small_normal.png'),
                    transparent: true,
                    side: THREE.DoubleSide
                });
                var ringGeometry = new THREE.RingGeometry(4, 100, 180, 1, 0, Math.PI * 2);
                var ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.rotation.x = Math.PI / 2;
                mesh.add(ring);
                mesh.rotation.x = Math.PI / 6;
            }
            else if (planet.model == 'Uranus') {
                var meshMaterial = new THREE.MeshLambertMaterial({color: 0xB7DDE0});
                var bodyGeometry = new THREE.SphereGeometry( URANUS_SIZE, 32, 32 );
                mesh = new THREE.Mesh(bodyGeometry, meshMaterial);
            }
            else if (planet.model == 'Neptune') {
                mesh = _this.makeBodyMesh(NEPTUNE_SIZE, 'img/textures/neptune_small.jpg',
                    'img/textures/neptune_small_normal.jpg');
            }

            _this.addBody(parent, planet.type, planet.orbit, mesh, true, planet.objectId, planet.model, planet.owner);
        }
        else if (planet.type == 'moon') {
            if (planet.model == 'Moon') {
                mesh = _this.makeBodyMesh(LUNA_SIZE, 'img/textures/moon_small.jpg', 'img/textures/moon_small_normal.jpg');
                parent = _this.getObjectByOrbitName('Earth').mesh;
            }
            // Jupiter's satellites
            else if (planet.model == 'Io') {
                mesh = _this.makeBodyMesh(IO_SIZE, 'img/textures/moon_small.jpg', 'img/textures/moon_small_normal.jpg');
                parent = _this.getObjectByOrbitName('Jupiter').mesh;
            }
            else if (planet.model == 'Europa') {
                mesh = _this.makeBodyMesh(EUROPA_SIZE, 'img/textures/moon_small.jpg', 'img/textures/moon_small_normal.jpg');
                parent = _this.getObjectByOrbitName('Jupiter').mesh;
            }
            else if (planet.model == 'Ganymede') {
                mesh = _this.makeBodyMesh(GANYMEDE_SIZE, 'img/textures/moon_small.jpg', 'img/textures/moon_small_normal.jpg');
                parent = _this.getObjectByOrbitName('Jupiter').mesh;
            }
            else if (planet.model == 'Callisto') {
                mesh = _this.makeBodyMesh(CALLISTO_SIZE, 'img/textures/moon_small.jpg', 'img/textures/moon_small_normal.jpg');
                parent = _this.getObjectByOrbitName('Jupiter').mesh;
            }
            // Mars' satellites
            else if (planet.model == 'Phobos') {
                mesh = _this.makeBodyMesh(PHOBOS_SIZE, 'img/textures/phobos_tiny.jpg', 'img/textures/phobos_tiny_normal.jpg');
                parent = _this.getObjectByOrbitName('Mars').mesh;
            }
            else if (planet.model == 'Deimos') {
                mesh = _this.makeBodyMesh(DEIMOS_SIZE, 'img/textures/deimos_tiny.jpg', 'img/textures/deimos_tiny_normal.jpg');
                parent = _this.getObjectByOrbitName('Mars').mesh;
            }
            // Saturn's satellites
            else if (planet.model == 'Titan') {
                var meshMaterial = new THREE.MeshLambertMaterial({color: 0xEACA51});
                var bodyGeometry = new THREE.SphereGeometry( TITAN_SIZE, 32, 32 );
                mesh = new THREE.Mesh(bodyGeometry, meshMaterial);
                parent = _this.getObjectByOrbitName('Saturn').mesh;
            }
            else if (planet.model == 'Rhea') {
                mesh = _this.makeBodyMesh(RHEA_SIZE, 'img/textures/asteroid_small.jpg',
                    'img/textures/asteroid_small_normal.jpg');
                parent = _this.getObjectByOrbitName('Saturn').mesh;
            }
            else if (planet.model == 'Iapetus') {
                mesh = _this.makeBodyMesh(IAPETUS_SIZE, 'img/textures/iapetus_small.jpg', 'img/textures/iapetus_small.jpg');
                parent = _this.getObjectByOrbitName('Saturn').mesh;
            }
            else if (planet.model == 'Dione') {
                mesh = _this.makeBodyMesh(DIONE_SIZE, 'img/textures/asteroid_small.jpg',
                    'img/textures/asteroid_small_normal.jpg');
                parent = _this.getObjectByOrbitName('Saturn').mesh;
            }
            else if (planet.model == 'Tethys') {
                var meshMaterial = new THREE.MeshPhongMaterial({
                    color: 0xCBAF97,
                    map: THREE.ImageUtils.loadTexture('img/textures/asteroid_small.jpg'),
                    normalMap: THREE.ImageUtils.loadTexture('img/textures/asteroid_small_normal.jpg')
                });
                var bodyGeometry = new THREE.SphereGeometry( TETHYS_SIZE, 32, 32 );
                mesh = new THREE.Mesh(bodyGeometry, meshMaterial);
                parent = _this.getObjectByOrbitName('Saturn').mesh;
            }
            // Uranus' satellites
            else if (planet.model == 'Miranda') {
                mesh = _this.makeBodyMesh(MIRANDA_SIZE, 'img/textures/asteroid_small.jpg',
                    'img/textures/asteroid_small_normal.jpg');
                parent = _this.getObjectByOrbitName('Uranus').mesh;
            }
            else if (planet.model == 'Ariel') {
                mesh = _this.makeBodyMesh(ARIEL_SIZE, 'img/textures/asteroid_small.jpg',
                    'img/textures/asteroid_small_normal.jpg');
                parent = _this.getObjectByOrbitName('Uranus').mesh;
            }
            else if (planet.model == 'Umbriel') {
                mesh = _this.makeBodyMesh(UMBRIEL_SIZE, 'img/textures/asteroid_small.jpg',
                    'img/textures/asteroid_small_normal.jpg');
                parent = _this.getObjectByOrbitName('Uranus').mesh;
            }
            else if (planet.model == 'Titania') {
                var meshMaterial = new THREE.MeshPhongMaterial({
                    color: 0xC0B7A8,
                    map: THREE.ImageUtils.loadTexture('img/textures/asteroid_small.jpg'),
                    normalMap: THREE.ImageUtils.loadTexture('img/textures/asteroid_small_normal.jpg')
                });
                var bodyGeometry = new THREE.SphereGeometry( TITANIA_SIZE, 32, 32 );
                mesh = new THREE.Mesh(bodyGeometry, meshMaterial);
                parent = _this.getObjectByOrbitName('Uranus').mesh;
            }
            else if (planet.model == 'Oberon') {
                var meshMaterial = new THREE.MeshPhongMaterial({
                    color: 0xC0B7A8,
                    map: THREE.ImageUtils.loadTexture('img/textures/asteroid_small.jpg'),
                    normalMap: THREE.ImageUtils.loadTexture('img/textures/asteroid_small_normal.jpg')
                });
                var bodyGeometry = new THREE.SphereGeometry( OBERON_SIZE, 32, 32 );
                mesh = new THREE.Mesh(bodyGeometry, meshMaterial);
                parent = _this.getObjectByOrbitName('Uranus').mesh;
            }
            //Neptune's satellites
            else if (planet.model == 'Proteus') {
                mesh = _this.makeBodyMesh(PROTEUS_SIZE, 'img/textures/asteroid_small.jpg',
                    'img/textures/asteroid_small_normal.jpg');
                parent = _this.getObjectByOrbitName('Neptune').mesh;
            }
            else if (planet.model == 'Triton') {
                var meshMaterial = new THREE.MeshPhongMaterial({
                    color: 0xC0B7A8,
                    map: THREE.ImageUtils.loadTexture('img/textures/asteroid_small.jpg'),
                    normalMap: THREE.ImageUtils.loadTexture('img/textures/asteroid_small_normal.jpg')
                });
                var bodyGeometry = new THREE.SphereGeometry( TRITON_SIZE, 32, 32 );
                mesh = new THREE.Mesh(bodyGeometry, meshMaterial);
                parent = _this.getObjectByOrbitName('Neptune').mesh;
            }
            else if (planet.model == 'Nereid') {
                mesh = _this.makeBodyMesh(NEREID_SIZE, 'img/textures/asteroid_small.jpg',
                    'img/textures/asteroid_small_normal.jpg');
                parent = _this.getObjectByOrbitName('Neptune').mesh;
            }
            _this.addBody(parent, planet.type, planet.orbit, mesh, true, planet.objectId, planet.model, planet.owner);
        }
    };

    this.getObjects = function() {return objects;};

    this.getObjectByOrbitName = function (objName) {
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            if (obj.orbit) {
                if (obj.orbit.name && obj.orbit.name == objName) return obj;
                if (obj.orbit.full_name && obj.orbit.full_name == objName) return obj;
            }
        }
        console.log("could not find", objName);
    }
};