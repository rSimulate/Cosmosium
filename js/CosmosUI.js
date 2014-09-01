CosmosUI = function () {
    "use strict";
    var _this = this;
    var selectedObject;
    var claimButt = document.getElementById('claim-asteroid-button');
    var mouse = new THREE.Vector3(0, 0);
    var SELECTING_TARGET = false;
    var sourceTarget;
    var projector = new THREE.Projector();
    var stats = new Stats();
    var cosmosRender, cosmosScene;
    var day = 'Mon';
    var month = 'Jan';
    var year = '1969';
    var camera, farCamera;
    var canvas, renderer;
    var userName;

    var SHOWING_ASTEROID_CLAIM = !(claimButt == null);
    // link to add the asteroid
    function claimButt_onClick(e) {
        e = e || window.event;
        e.stopPropagation();
        var obj = {owner: selectedObject.owner, objectId: selectedObject.objectId, orbitName: selectedObject.orbit.name};
        var stringify = JSON.stringify(obj).replace(/\"+/g, "\'");
        ws.send(message('claim', stringify));

    }


    this.init = function (_cosmosScene, _cosmosRender) {
        cosmosRender = _cosmosRender;
        cosmosScene = _cosmosScene;
        renderer = cosmosRender.getRenderer();
        camera = cosmosRender.getCamera(false);
        farCamera = cosmosRender.getCamera(true);
        canvas = $('#canvas');
        userName = $('#userName').text();

        initStats();

        // wipe object list on init to clean things that might have been left over from a refresh event
        $('.playerObject').remove();

        $('#player-object-container').hide();
        $('#course-container').hide();

        // update top menu bar every second
        setInterval(function () {
            var el = document.getElementById('gametime');
            el.innerHTML = day + ' ' + month + ' ' + year;
        }, 1000);

        // Configure webGL canvas to conform to parent div
        $(renderer.domElement).css('height', '');
        renderer.setSize(canvas.width(), canvas.height());
        camera.aspect = canvas.width() / canvas.height();
        farCamera.aspect = canvas.width() / canvas.height();
        camera.updateProjectionMatrix();
        farCamera.updateProjectionMatrix();
        claimButt.addEventListener('click', claimButt_onClick, false);
    };

    this.update = function () {
        stats.update();
    };

    this.getUser = function () {
        return userName;
    };

    this.getSelectedObject = function () {return selectedObject;};

    this.setDay = function (newDay) {
        day = newDay;
    };

    this.setMonth = function (newMonth) {
        month = newMonth;
    };

    this.setYear = function (newYear) {
        year = newYear;
    };

    this.getDay = function () {
        return day;
    };

    this.getMonth = function () {
        return month;
    };

    this.getYear = function () {
        return year;
    };

    this.login = function (username, password) {
        var info = {username: username, password: CryptoJS.SHA256(password)};
        info = JSON.stringify(info);

        ws.send(message('login', info));
    };

    this.register = function (username, password, repeatPass, org, quote) {
        // Returns false if user inputs the wrong password twice, else true
        // This is to prevent database flogging with a false password
        // Server will make sure both passwords are the same as well
        if (password !== repeatPass) {
            return false;
        }
        var info = {username: username, password: CryptoJS.SHA256(password), repeatPass: CryptoJS.SHA256(repeatPass),
            org: org, quote: quote};
        info = JSON.stringify(info);

        ws.send(message('register', info));
        return true;
    };

    this.notify = function (phrase) {
        // takes a incoming message as a string and notifies the user in various ways

        if (phrase == 'Login Successful') {

        }
        else if (phrase == 'Wrong Password') {

        }
        else if (phrase == 'Passwords do not match') {

        }
        else if (phrase == 'User not Found') {

        }
        else if (phrase == 'User Name Already Exists') {

        }
        else if (phrase == 'signout') {
            // Google
            (function () {
                var po = document.createElement('script');
                po.type = 'text/javascript';
                po.async = true;
                po.src = 'https://apis.google.com/js/plusone.js?onload=rsimulate.cosmosUI.googleSignout';
                var s = document.getElementsByTagName('script')[0];
                s.parentNode.insertBefore(po, s);
            })();
        }
        else {
            console.log("Phrase " + phrase + " is not supported yet.");
        }
    };

    this.googleSignout = function () {
        gapi.auth.signOut();
        window.location.href = 'http://asteroid.ventures'
    };

    this.requestCourse = function (e) {
        console.log("Requesting to set a new course");

        sourceTarget = selectedObject;
        SELECTING_TARGET = true;
        $('#course-container').show();

        _this.onBodyDeselected();

        e.preventDefault();
    };

    this.cancelCourse = function (e) {
        console.log("Cancelling new course");

        SELECTING_TARGET = false;
        sourceTarget = undefined;
        $('#course-container').hide();

        _this.onBodyDeselected();

        e.stopPropagation();
        e.preventDefault();
    };

    this.setCourse = function () {
        var stringify;
        var destTarget;
        var res = 20;
        var data;

        console.log("Setting course");
        SELECTING_TARGET = false;
        destTarget = selectedObject;
        $('#course-container').hide();
        _this.onBodyDeselected();

        cosmosRender.orbitCamera(sourceTarget);
        sourceTarget.dest = destTarget;
        data = {
            source: {objectId: sourceTarget.objectId, type: sourceTarget.type},
            dest: {objectId: destTarget.objectId, type: destTarget.type},
            res: res
        };
        destTarget = undefined;
        stringify = JSON.stringify(data).replace(/\"+/g, "\'");
        ws.send(message('requestTraj', stringify));
    };

    this.addTrajectory = function (sourceId, traj) {
        // source = objectId, traj = [t[], x[], y[], z[]]
        console.log(sourceId);
        var sourceObj = cosmosScene.getObjectByObjectId(sourceId);
        sourceObj.traj = traj;
        console.log(sourceObj.traj);
        cosmosRender.orbitCamera(sourceObj);
    };

    this.addPlayerObject = function (obj) {
        // append a new object specific button to the list
        var orbit = obj.orbit;
        var textName = cleanOrbitName(orbit.name);
        $("<li class='playerObject'><a id=" + orbit.name + " href='#'>" + "<i class='fa fa-angle-double-right'></i>" +
            textName + "</a></li>").appendTo('#object-list-container');

        // add listener to object specific div
        document.getElementById(orbit.name).addEventListener('click', function () {
            selectedObject = obj;
            _this.onBodySelected(obj.mesh);
            cosmosRender.orbitCamera(selectedObject);
        }, false);
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

        var raycaster = new THREE.Raycaster(camera.position,
            vector.sub(camera.position).normalize());
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

        $('#player-object-container').hide();
        $('#claim-asteroid-button').hide();

        var orbit = obj.orbit;
        if (orbit != undefined) {
            orbit.getEllipse().visible = true;
            if (orbit && orbit.eph && orbit.eph.full_name) {
                this.bodyName = cleanOrbitName(orbit.eph.full_name);
            } else if (orbit && orbit.name) {
                this.bodyName = cleanOrbitName(orbit.name);
            }
            var infoHTML = "<h3>" + this.bodyName + "</h3>";
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


            if (obj.type == 'playerObject' || obj.type == 'asteroid') {
                $("#owner-info").html('claimed by <b>"' + obj.owner + '"</b>')
                    //.attr("color", "rgb(" + ownerColor.r + ',' + ownerColor.g + ',' + ownerColor.b + ')')
                    .html('<b>' + obj.owner + '</b>').attr("color", 'rgb(200,200,200)');

                if (obj.type == 'playerObject' && obj.owner == userName) $('#player-object-container').show();
                else if (obj.type == 'asteroid') $('#claim-asteroid-button').show();
            }
            $("#body-info").html(infoHTML);
        }
        else {
            $("#body-info").html(obj.model);
        }

        $("#body-info-container").show();

        selectedObject = obj;

        cosmosRender.orbitCamera(selectedObject);


    };

    this.onBodyDeselected = function () {
        if (cosmosScene) cosmosScene.hideAllConditionalEllipses();
        $("#body-info-container").hide();
        $('#player-object-container').hide();
        $('#claim-asteroid-button').hide();
        selectedObject = undefined;
    };

    function initStats() {
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.bottom = '0px';
        stats.domElement.style.zIndex = 1010;
        $('#canvas').append(stats.domElement);
    }
};