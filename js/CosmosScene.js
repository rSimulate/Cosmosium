

var CosmosScene = function (cosmosUI) {
    var _this = this;
    var NUM_BIG_PARTICLES = 500;
    var particle_system_geometry = null;

    var LOD_DIST = {ONE: 100, TWO: 300, THREE: 500, MAX: 1500};
    var objects = []; // {owner: owner, objectId: objectId, type: type, model: model, orbit: orbit, mesh: mesh, parent: scene}
    var players = []; // {player: playerName, color: THREE.Color}
    var scene = new THREE.Scene();
    var cosmosRender;
    var particleGroups = [];
    var hexBodies = [];

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
    this.getHexBodies = function () {return hexBodies;};

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


        var obj = {owner: owner, objectId: objectId, type: type, model: model, orbit: orbit, mesh: mesh, parent: parent,
            launched: false
        };
        objects.push(obj);

        // orbit sun at start of game
        if (obj.model == 'Sun') {
            this.sun = obj;
        }

        if (type == 'playerObject') {
            // add to player object div
            cosmosUI.addPlayerObject(obj);
        }
        else if (type == 'asteroid') {
            obj.mesh.userData = {boundingBox: new THREE.Box3().setFromObject(obj.mesh)};
        }
        parent.add(mesh);
    };

    this.requestRemoveBody = function (e) {
        console.log("Called for removal of objectID " + cosmosUI.getSelectedObject().objectId);
        ws.send(message('playerObject',"{'data': {'cmd': 'destroy', 'uuid': '"
                                    + cosmosUI.getSelectedObject().objectId + "'}}"));
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

    this.removeSceneObject = function(parentScene, object) {
        "use strict";

        if (parentScene == undefined) { parentScene = scene; }
        parentScene.remove(object);
    };

    this.getWorldPos = function (mesh) {
        "use strict";
        var vector = new THREE.Vector3();
        return vector.setFromMatrixPosition(mesh.matrixWorld);
    };

    this.detachObject = function (object) {
        "use strict";
        // removes object from moon or other orbital body if parent is not scene
        if (object.orbit) {_this.removeSceneObject(object.parent, object.orbit.getEllipse());}
        object.full_name = object.orbit.name;
        object.orbit = undefined;

        if (object.parent instanceof THREE.Scene == false) {
            THREE.SceneUtils.detach(object.mesh, object.parent, _this.getScene());
            object.parent = _this.getScene();
        }
    };

    this.attachObject = function (object, parentMesh) {
        "use strict";

        if (object.hasOwnProperty('trajLine')) {
            _this.removeSceneObject(_this.getScene(), object.trajLine.endNode);
            _this.removeSceneObject(_this.getScene(), object.trajLine);
            object.launched = false;
            delete object.traj;
            delete object.trajLine;
        }

        // attaches object to a moon or other orbital body
        THREE.SceneUtils.attach(object.mesh, _this.getScene(), parentMesh);
        object.parent = parentMesh;


        if (object.orbit) {object.parent.add(object.orbit.getEllipse());}
    };

    this.generateOrbit = function (obj, apoapsis, destRadius) {
        "use strict";
        if (obj.full_name == undefined || obj.dest == undefined) {
            console.log("ERROR: Could not generate orbit");
            console.log("obj.full_name:", obj.full_name, "obj.dest", obj.dest);
            return
        }

        var eph = {
            P: 10,
            e: 0,
            a: apoapsis * 0.003,
            i: 0,
            om: 0,
            w: 0,
            ma: 0,
            epoch: cosmosRender.getJED()
        };
        obj.orbit = new Orbit3D(eph, {
            color: 0xff0000,
            display_color: 0xff0000,
            width: 2,
            object_size: 1 < 0 ? 50 : 15, //1.5,
            jed: cosmosRender.getJED(),
            particle_geometry: null, // will add itself to this geometry
            name: obj.full_name
        }, false);


        if (obj.dest.type == 'playerObject' || destRadius < 3) {
            var dOrbit = obj.dest.orbit;
            // change the orbit a little to show both objects
            eph.P = dOrbit.eph.P;
            eph.a = dOrbit.eph.a * 0.98;
            eph.e = dOrbit.eph.e;
            eph.i = dOrbit.eph.i;
            eph.om = dOrbit.eph.om;
            eph.w = dOrbit.eph.w;
            eph.ma = dOrbit.eph.ma;
            obj.orbit = new Orbit3D(eph, {
                color: 0xff0000,
                display_color: 0xff0000,
                width: 2,
                object_size: 1 < 0 ? 50 : 15, //1.5,
                jed: cosmosRender.getJED(),
                particle_geometry: null, // will add itself to this geometry
                name: obj.full_name
            }, false);

            _this.attachObject(obj, obj.dest.parent);
        }
        else {
            _this.attachObject(obj, obj.dest.mesh);
        }

        delete obj.full_name;
        delete obj.dest;
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
                obj3d.scale.x = obj3d.scale.y = obj3d.scale.z = 0.05;
                obj3d.updateMatrix();
                obj3d.userData = {boundingBox: new THREE.Box3().setFromObject(obj3d)};

                // add to scene
                _this.addBody(scene, "playerObject", object.orbit, obj3d, true, object.objectId, object.model, object.owner);
            }
            else {console.log("ERROR: Parsing blender model failed");}
        });
    };

    this.addTrajectory = function (line) {
        "use strict";

        _this.getScene().add(line);
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

        if (asteroid.orbit.full_name.indexOf('Ceres') <= 0 && asteroid.orbit.full_name.indexOf('Pallas') <= 0 &&
            asteroid.orbit.full_name.indexOf('Vesta') <= 0 && asteroid.orbit.full_name.indexOf('Euphrosyne') <= 0) {

            var particleGroup = generateAsteroidParticleGroup(baseAsteroidSize);
            lod.addLevel(particleGroup.mesh, LOD_DIST.MAX);
        }

        _this.addAsteroid(asteroidOrbit, lod, asteroid.objectId, asteroid.type, asteroid.owner);
    };

    // Create particle group and emitter
    function generateAsteroidParticleGroup(size) {
        var particleCount = 100;

        // scale particle count by the base size of the asteroid
        var normSize = size / 7;
        var particleSize = normSize * 3;
        var radius = particleSize / 2;

        var particleGroup = new SPE.Group({
            texture: THREE.ImageUtils.loadTexture('img/user-bg.png'),
            maxAge: 5
        });

        var emitter = new SPE.Emitter({
            type: 'sphere',

            position: new THREE.Vector3(0, 0, 0),

            radius: radius,
            speed: particleSize,

            colorStart: new THREE.Color('white'),
            colorMiddle: new THREE.Color('white'),
            colorEnd: new THREE.Color('white'),
            sizeStart: particleSize * 2,
            sizeEnd: 0,

            opacityStart: 1,
            opacityMiddle: 1,
            opacityEnd: 0.2,

            particleCount: normSize * 100,
            angleAlignVelocity: 1
        });

        particleGroup.addEmitter( emitter );
        particleGroups.push(particleGroup);

        return particleGroup;
    }

    this.getParticleGroups = function() {
        return particleGroups;
    };

    function createHexBody(size, diffuseTex, normal) {
        var vertexSky = $("#vertexSky").text();
        var fragmentSky = $("#fragmentSky").text();
        var vertexGround = $("#vertexGround").text();
        var fragmentGround = $("#fragmentGround").text();

        var diffuse = THREE.ImageUtils.loadTexture(diffuseTex);
        var diffuseNight = THREE.ImageUtils.loadTexture('img/textures/MARSnight.jpg');
        var maxAnisotropy = cosmosRender.getRenderer().getMaxAnisotropy();

        diffuse.anisotropy = maxAnisotropy;
        diffuseNight.anisotropy = maxAnisotropy;

        var radius = size;
        var atmosphere = {
            Kr: 0.0025,
            Km: 0.0010,
            ESun: 15.0,
            g: -0.950,
            innerRadius: size,
            outerRadius: size * 1.015,
            wavelength: [0.650, 0.670, 0.670],
            scaleDepth: 0.25,
            mieScaleDepth: 0.1
        };

        var uniforms = {
            v3CameraPosition: {
                type: "v3",
                value: new THREE.Vector3(0, 0, 15)
            },
            v3LightPosition: {
                type: "v3",
                value: new THREE.Vector3(1e8, 0, 1e8).normalize()
            },
            v3InvWavelength: {
                type: "v3",
                value: new THREE.Vector3(1 / Math.pow(atmosphere.wavelength[0], 4), 1 / Math.pow(atmosphere.wavelength[1], 4), 1 / Math.pow(atmosphere.wavelength[2], 4))
            },
            fCameraHeight: {
                type: "f",
                value: 0
            },
            fCameraHeight2: {
                type: "f",
                value: 0
            },
            fInnerRadius: {
                type: "f",
                value: atmosphere.innerRadius
            },
            fInnerRadius2: {
                type: "f",
                value: atmosphere.innerRadius * atmosphere.innerRadius
            },
            fOuterRadius: {
                type: "f",
                value: atmosphere.outerRadius
            },
            fOuterRadius2: {
                type: "f",
                value: atmosphere.outerRadius * atmosphere.outerRadius
            },
            fKrESun: {
                type: "f",
                value: atmosphere.Kr * atmosphere.ESun
            },
            fKmESun: {
                type: "f",
                value: atmosphere.Km * atmosphere.ESun
            },
            fKr4PI: {
                type: "f",
                value: atmosphere.Kr * 4.0 * Math.PI
            },
            fKm4PI: {
                type: "f",
                value: atmosphere.Km * 4.0 * Math.PI
            },
            fScale: {
                type: "f",
                value: 1 / (atmosphere.outerRadius - atmosphere.innerRadius)
            },
            fScaleDepth: {
                type: "f",
                value: atmosphere.scaleDepth
            },
            fScaleOverScaleDepth: {
                type: "f",
                value: 1 / (atmosphere.outerRadius - atmosphere.innerRadius) / atmosphere.scaleDepth
            },
            g: {
                type: "f",
                value: atmosphere.g
            },
            g2: {
                type: "f",
                value: atmosphere.g * atmosphere.g
            },
            nSamples: {
                type: "i",
                value: 3
            },
            fSamples: {
                type: "f",
                value: 3.0
            },
            tDiffuse: {
                type: "t",
                value: diffuse
            },
            tDiffuseNight: {
                type: "t",
                value: diffuseNight
            },
            tDisplacement: {
                type: "t",
                value: 0
            },
            tSkyboxDiffuse: {
                type: "t",
                value: 0
            },
            fNightScale: {
                type: "f",
                value: 1
            },
            m4ModelInverse: {
                type: "m4",
                value: THREE.Matrix4()
            }
        };

        var planetgeometry	= new THREE.SphereGeometry(size, 50, 250);
        var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexGround,
            fragmentShader: fragmentGround});
        var planetmesh	= new THREE.Mesh(planetgeometry, material);

        var cloudgeometry	= new THREE.SphereGeometry(size + 0.02, 50, 50);
        var cloudmaterial	= new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture("img/textures/clouds.png"),
            color: 0x000000,
            transparent: true,
            reflectivity: 0.95,
            opacity: 0.2});
        var cloudmesh	= new THREE.Mesh(cloudgeometry, cloudmaterial);
        planetmesh.add(cloudmesh);

        var hexgeometry	= new THREE.IcosahedronGeometry(atmosphere.outerRadius + 0.01, 4);
        for(var f in hexgeometry.faceVertexUvs[0]){
            var uvs = hexgeometry.faceVertexUvs[0][f];
            uvs[0] = new THREE.Vector2(0.20, 0.73);
            uvs[1] = new THREE.Vector2(0.51, 0.15);
            uvs[2] = new THREE.Vector2(0.78, 0.70);
        }

        var material	= new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture("img/textures/hex03.png"),
            color: 0xFFFF00,
            transparent: true,
            opacity: 0.25
        });
        var hexmesh	= new THREE.Mesh(hexgeometry, material);
        planetmesh.add(hexmesh);

        var atmopheregeometry	= new THREE.SphereGeometry(atmosphere.outerRadius, 50, 50);
        var atmospherematerial	= new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexSky,
            fragmentShader: fragmentSky
        });
        var vector = new THREE.Vector3(1, 0, 0);
        var cameraHeight = cosmosRender.getCamera(false).position.length();
        var atmospheremesh	= new THREE.Mesh(atmopheregeometry, atmospherematerial);
        atmospheremesh.material.side = THREE.BackSide;
        atmospheremesh.material.transparent = true;
        planetmesh.add(atmospheremesh);
        planetmesh.showHex = true;
        hexBodies.push({planet: planetmesh, atmosphere: atmospheremesh, hex: hexmesh});
        return planetmesh;
    }

    this.addPlanet = function(planet) {
        //
        var mesh = undefined;
        var parent = scene;
        if (planet.type == 'planet') {
            if (planet.model == 'Mercury') {
                mesh = createHexBody(MERCURY_SIZE, 'img/textures/mercury_small.jpg',
                    'img/textures/mercury_small_normal.jpg');
            }
            else if (planet.model == 'Venus') {
                mesh = createHexBody(VENUS_SIZE, 'img/textures/venus_small.jpg', 'img/textures/venus_small_normal.jpg');
            }
            else if (planet.model == 'Earth') {
                mesh = createHexBody(EARTH_SIZE, 'img/textures/earth_small.jpg', 'img/textures/earth_small_normal.jpg');
            }
            else if (planet.model == 'Mars') {
                mesh = createHexBody(MARS_SIZE, 'img/textures/mars_small.jpg', 'img/textures/mars_small_normal.jpg');
            }
            else if (planet.model == 'Jupiter') {
                mesh = createHexBody(JUPITER_SIZE, 'img/textures/jupiter_small.jpg',
                    'img/textures/jupiter_small_normal.jpg');
            }
            else if (planet.model == 'Saturn') {
                mesh = createHexBody(SATURN_SIZE, 'img/textures/saturn_medium.jpg',
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
                var ringGeometry = new THREE.RingGeometry(0.1, 36, 180, 1, 0, Math.PI * 2);
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
                mesh = createHexBody(NEPTUNE_SIZE, 'img/textures/neptune_small.jpg',
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
    };

    this.getObjectByObjectId = function (id) {
        "use strict";

        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            if (obj.objectId == id) return obj;
        }
        console.log("could not find object by id:", id);
    };
};