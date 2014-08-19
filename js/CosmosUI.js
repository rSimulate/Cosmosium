

function CosmosUI () {
    var selectedObject = undefined;
    var claimButt = document.getElementById('claim-asteroid-button');

    var SHOWING_ASTEROID_CLAIM = !(claimButt == null);
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

    function init() {

        initStats();

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

    function initStats() {
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        stats.domElement.style.zIndex = 1010;
        $('#canvas').append( stats.domElement );
    }

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

    function onBodyDeselected() {
        hideAllConditionalEllipses();
        $("#body-info-container").hide();
        $('#player-object-container').hide();
        $('#claim-asteroid-button').hide();
        selectedObject = undefined;
    }
}