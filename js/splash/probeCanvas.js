if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var ProbeCanvas = function() {
    console.log("Initiating Probe Canvas");
    // set the scene size
    var WIDTH = $(document.body).width() * 0.2,
        HEIGHT = $(document.body).height() * 0.1;

    // set some camera attributes
    var VIEW_ANGLE = 45,
        ASPECT = WIDTH / HEIGHT,
        NEAR = 0.1,
        FAR = 10000;

    // get the DOM element to attach to
    var $container = $('#probe');
    var renderer, camera, scene, controls;

    function probeInit() {
        // create a WebGL renderer, camera
        // and a scene
        renderer = new THREE.WebGLRenderer();
        camera =
            new THREE.PerspectiveCamera(
                VIEW_ANGLE,
                ASPECT,
                NEAR,
                FAR);

        scene = new THREE.Scene();

        // add the camera to the scene
        scene.add(camera);

        // the camera starts at 0,0,0
        // so pull it back
        camera.position.z = 10;

        // start the renderer
        renderer.setSize(WIDTH, HEIGHT);

        // attach the render-supplied DOM element
        $container.append(renderer.domElement);

        // controls
        controls = new THREE.OrbitControls(camera, renderer.domElement);

        // create a point light
        var pointLight = new THREE.PointLight(0xFFFFFF);

        // set its position
        pointLight.position.x = 30;
        pointLight.position.y = 50;
        pointLight.position.z = -50;

        // add to the scene
        scene.add(pointLight);
    }

    function initSkybox() {
        var geometry = new THREE.SphereGeometry(FAR / 2.0, 60, 40);

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

    function generateBlenderMesh(daePath) {
        var loader = new THREE.ColladaLoader();
        loader.options.convertUpAxis = true;

        // If you had animations, you would add to the second argument function below
        var obj3d;
        loader.load(daePath, function (collada) {
            obj3d = collada.scene;
            if (obj3d != undefined) {
                obj3d.scale.x = obj3d.scale.y = obj3d.scale.z = 1;
                obj3d.updateMatrix();
                obj3d.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);

                // add to scene
                scene.add(obj3d);
            }
            else {console.log("ERROR: Parsing blender model failed");}
        });
    }

    function animate() {
        requestAnimationFrame(animate, undefined);
        controls.update();
        renderer.render(scene, camera);
    }

    this.main = function() {
        probeInit();
        initSkybox();
        generateBlenderMesh('/models/NewHorizons/newHorizons.dae');
        animate();
    };
};

var probeCanvas = new ProbeCanvas();
probeCanvas.main();