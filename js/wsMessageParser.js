function prependContent(newContent){
    // adds new content HTML to the beginning of the content section
    document.getElementById('content').innerHTML = newContent + document.getElementById('content').innerHTML;
}

function updateResources(newHTML){
    // replaces resource bar HTML with fresh, updated code. 
    document.getElementById("resource-bar").innerHTML = newHTML;
}

function parsePlayerObject(objectStr) {
    //{'owner': ownerName, 'objectId': uuid.uuid4(), 'type': objectType, 'model': model, 'data': data}
    // clean string and parse everything but data. NOTE: Data should be the last item in the dict
    var str = objectStr.replace(/([\:\,\{\}])+/g, "");
    var split = str.split(" ");
    var owner, objectId, type, model, data, orbit;
    for (var i = 0; i < split.length; i++) {
        var s = split[i];
        var next = i+1;
        if (s == 'owner') {
            owner = split[next];
        }
        else if (s == 'objectId') {
            objectId = split[next];
        }
        else if (s == 'type') {
            type = split[next];
        }
        else if (s == 'model') {
            model = split[next];
        }
        else if (s == 'data') {
            data = split.slice(next);
            break;
        }
    }

    // info check
    if ((owner == undefined) || (objectId == undefined) || (type == undefined)
                             || (model == undefined) || (data == undefined)) {
        console.log("ERROR parsing player object data returned from server. objectId: " + objectId);
        return null;
    }

    //parse object data. NOTE: orbit should be the last item in the dict
    for (var u = 0; u < data.length; u++) {
        var st = data[u];
        var nxt = u+1;
        if (st == 'orbit') {
            orbit = data.slice(nxt);
            break;
        }
    }

    // parse orbit
    for (var q = 0; q < orbit.length; q++) {
        // TODO: Parse Orbit and set it equal to orbit var
    }

    // data check
    if (orbit == undefined) {
        console.log("ERROR parsing player object data returned from server. objectId: " + objectId);
        return null;
    }

    return {owner: owner, objectId: objectId, type: type, model: model, orbit: orbit};
}

function parseMessage(m) {
    // interprets and carries out messages

    var cmd = m.split('"')[3];  // this should be right so long as "cmd" is listed first...
    var data = m.split(',"data":"')[1].slice(0, -2); // this assumes "data" is listed last

    if (cmd == "addToContent") {
        prependContent(data)
    } else if (cmd == "updateResources") {
        updateResources(data)
    } else if (cmd == "researchCompleted") {
        // try sending update to techtree (only works if techtree is displayed)
        techtree.completeResearch(data);
        // TODO: add user notification?
    } else if (cmd == "pObjCreate") {
        var object = parsePlayerObject(data);
        if (object != null) {
            var path = getPathForModel(object.model);
            if (path != null) {
                rSimulate.addBlenderPlayerObjectMesh(path, object.orbit);
            }
            else {console.log("Could not find model path for object " + object.objectId)}
        }
        else {console.log("Parsing failed for unknown object")}
    } else if (cmd == "pObjRequest") {
        // TODO: display template
    } else if (cmd == "pObjDestroyRequest") {
        // TODO: do something with the result of the destroy request
    } else {
        console.log("ERR: unknown message to client: "+m);
    }
}