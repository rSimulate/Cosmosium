CosmosUI = function () {
    "use strict";
    var _this = this;
    var selectedObject;
    var mouse = new THREE.Vector3(0, 0);
    var projector = new THREE.Projector();
    var cosmosRender, cosmosScene;
    var camera, farCamera;
    var canvas, renderer;

    this.init = function (_cosmosScene, _cosmosRender) {
        cosmosRender = _cosmosRender;
        cosmosScene = _cosmosScene;
        renderer = cosmosRender.getRenderer();
        camera = cosmosRender.getCamera(false);
        farCamera = cosmosRender.getCamera(true);
        canvas = $('#solarSystem');

        // Configure webGL canvas to conform to parent div
        renderer.setSize(canvas.width(), canvas.height());
        camera.aspect = canvas.width() / canvas.height();
        farCamera.aspect = canvas.width() / canvas.height();
        camera.updateProjectionMatrix();
        farCamera.updateProjectionMatrix();
    };

    this.getSelectedObject = function () {return selectedObject;};

    this.addPlayerObject = function (obj) {
        // append a new object specific button to the list
        var orbit = obj.orbit;
        /*var textName = cleanOrbitName(orbit.name);
        $("<li class='playerObject'><a id=" + orbit.name + " href='#'>" + "<i class='fa fa-angle-double-right'></i>" +
            textName + "</a></li>").appendTo('#object-list-container');

        // add listener to object specific div
        document.getElementById(orbit.name).addEventListener('click', function () {
            selectedObject = obj;
            _this.onBodySelected(obj.mesh);
            cosmosRender.orbitCamera(selectedObject);
        }, false);*/
    };

    this.onDocumentMouseMove = function (event) {
        event.preventDefault();

        // Compatibility fix for Firefox; event.offsetX/Y is not supported in FF
        var offsetX = event.offsetX == undefined ? event.layerX : event.offsetX;
        var offsetY = event.offsetY == undefined ? event.layerY : event.offsetY;

        mouse.x = ( offsetX / $(canvas).width() ) * 2 - 1;
        mouse.y = -( offsetY / $(canvas).height() ) * 2 + 1;

        var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
        projector.unprojectVector(vector, camera);

        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        var intersects = raycaster.intersectObjects(cosmosScene.getScene().children, true);

        if (intersects.length > 0) {
            if (this.INTERSECTED != intersects[ 0 ].object) {
                //if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
                this.INTERSECTED = intersects[ 0 ].object;
                //INTERSECTED.currentHex = INTERSECTED.material.color.gGetHex();
            }
            canvas.css('cursor', 'pointer');
        } else {
            //if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
            this.INTERSECTED = null;
            canvas.css('cursor', 'auto');
        }
    };

    this.onDocumentMouseDown = function (event) {
        event.preventDefault();
        if (event.button == 0) {
            var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
            projector.unprojectVector(vector, camera);

            var raycaster = new THREE.Raycaster(camera.position,
                vector.sub(camera.position).normalize());

            var intersects = raycaster.intersectObjects(cosmosScene.getScene().children, true);

            if (intersects.length > 0) {

                _this.onBodySelected(intersects[ 0 ].object);

            } else {
                _this.onBodyDeselected();
            }
        }
        else if (event.button == 1) {
            cosmosRender.orbitCamera(cosmosScene.getSolarCentricObject());
            _this.onBodyDeselected();
        }
        else if (event.button == 2) {
            cosmosRender.clearCameraTarget();
            _this.onBodyDeselected();
        }
    };

    this.onDocumentMouseUp = function (event) {

        event.preventDefault();

        canvas.css('cursor', 'auto');

    };

    this.onBodySelected = function (mesh) {
        if (mesh instanceof THREE.Line) {
            return;
        }
        cosmosScene.hideAllConditionalEllipses();

        var obj = undefined;
        var objects = cosmosScene.getObjects();
        // broken up into two for-loops to avoid racing
        for (var i = 0; i < objects.length; i++) {
            var object = objects[i];

            if (object.mesh.uuid == mesh.uuid) {
                obj = object;
                break;
            }
        }
        if (obj == undefined) {
            for (var i = 0; i < objects.length; i++) {
                var object = objects[i];
                if (object.mesh.children != undefined) {
                    var result = object.mesh.getObjectById(mesh.id, true);
                    if (result) {
                        obj = object;
                    }
                }
            }
        }


        if (obj == undefined) {
            console.log("ERROR: Could not find selected object's ID");
            return;
        }

        var orbit = obj.orbit;
        if (orbit != undefined) {
            orbit.getEllipse().visible = true;
        }
        selectedObject = obj;

        cosmosRender.orbitCamera(selectedObject);
    };

    this.onBodyDeselected = function () {
        if (cosmosScene) cosmosScene.hideAllConditionalEllipses();
        selectedObject = undefined;
    };
};