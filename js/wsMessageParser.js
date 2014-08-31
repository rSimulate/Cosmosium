var nextColor = 1;

function prependContent(newContent){
    // adds new content HTML to the beginning of the content section
    document.getElementById('content').innerHTML = newContent + document.getElementById('content').innerHTML;
}

function updateResources(resources_json_str){
    /*
    updates player resources using given dict/json string
    */
    eval("var vals = " + resources_json_str);

    // update resource deltas
    player.dScience = vals.dScience;
    player.dWealth  = vals.dWealth;
    player.dEnergy  = vals.dEnergy;
    player.dMetal   = vals.dMetal;
    player.dOrganic = vals.dOrganic;

    // update resources
    player.science= vals.science;
    player.wealth=  vals.wealth;
    player.energy=  vals.energy;
    player.metal=   vals.metal;
    player.organic=  vals.organic;
}

function cleanObjectRequest(objectStr) {
    // clean string related to player object requests
    var str = objectStr.replace(/([\:\,\'\{\}\(\)])+/g, "");
    str = str.replace(/(UUID)+/g, "");
    str = str.replace(/([\(\)])+/g, "");

    return str.split(" ");
}

function parseObjectRemoval(str) {
    var split = cleanObjectRequest(str);
    // result result objectId uuid reason unknown
    var result, objectId, reason;
    for (var i = 0; i < split.length; i++) {
        var s = split[i];
        var next = i+1;
        if (s == 'result') {
            result = split[next];
        }
        else if (s == 'objectId') {
            objectId = split[next];
        }
        else if (s == 'reason') {
            reason = split[next];
        }
    }

    // check
    if ((result == undefined) || (objectId == undefined) || (reason == undefined)) {
        console.log("ERROR parsing object removal request. Object not removed");
        return {result: false, objectId: objectId, reason: 'Removal request parsing failed.'};
    }

    return {result: result, objectId: objectId, reason: reason};
}

function parseObject(objectStr) {
    //{'owner': ownerName, 'objectId': uuid.uuid4(), 'type': objectType, 'model': model, 'data': data}
    // clean string and parse everything but data. NOTE: Data should be the last item in the dict
    var split = cleanObjectRequest(objectStr);
    var owner, objectId, type, model, orbitExtrasData, orbitData;
    for (var ii = 0; ii < split.length; ii++) {
        var s = split[ii];
        var next = ii+1;
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
        else if (s == 'orbitExtras') {
            orbitExtrasData = split.slice(next, next+4);
        }
        else if (s == 'orbit') {
            orbitData = split.slice(next, next+22);
        }
    }

    // info check
    if ((owner == undefined) || (objectId == undefined) || (type == undefined)
                             || (model == undefined) || (orbitData == undefined)) {
        console.log("ERROR parsing object data returned from server. objectId: " + objectId);
        console.log("owner " + owner + " type " + type + " model " + model + " orbit " + orbitData);
        return null;
    }

    // parse orbitExtras
    var orbitExtras;
    if (orbitExtrasData != undefined) {
        var H, diameter;
        for (var c = 0; c < orbitExtrasData.length; c++) {
            var strin = orbitExtrasData[c];
            var g = c+1;
            if (strin == 'H') {
                H = orbitExtrasData[g];
            }
            else if (strin == 'diameter') {
                diameter = orbitExtrasData[g];
            }
        }

        // orbitExtrasData check
        if ((H == undefined) || (diameter == undefined)) {
            console.log("ERROR parsing asteroid orbitExtras for objectId " + objectId);
            console.log("H: " + H + " diameter: " + diameter);
            return null;
        }
        orbitExtras = {H: H, diameter: diameter};
    }
    else if (type == 'asteroid') {
        console.log("ERROR parsing asteroid orbitExtras for objectId " + objectId);
    }


    // parse orbit
    var ma, epoch, a, e, i, w_bar, w, L, om, P, full_name;
    for (var q = 0; q < orbitData.length; q++) {
        var stri = orbitData[q];
        var n = q+1;
        if (stri == 'ma') {
            ma = orbitData[n];
        }
        else if (stri == 'epoch') {
            epoch = orbitData[n];
        }
        else if (stri == 'a') {
            a = orbitData[n];
        }
        else if (stri == 'e') {
            e = orbitData[n];
        }
        else if (stri == 'i') {
            i = orbitData[n];
        }
        else if (stri == 'w_bar') {
            w_bar = orbitData[n];
        }
        else if (stri == 'w') {
            w = orbitData[n];
        }
        else if (stri == 'L') {
            L = orbitData[n];
        }
        else if (stri == 'om') {
            om = orbitData[n];
        }
        else if (stri == 'P') {
            P = orbitData[n];
        }
        else if (stri == 'full_name') {
            full_name = orbitData[n];
        }
    }

    // data check
    if ((P == undefined) || (e == undefined) || (full_name == undefined)
            || (ma == undefined) || (a == undefined) || (i == undefined) || (w_bar == undefined)
            || (w == undefined) || (L == undefined) || (om == undefined)
            || (P == undefined)) {
        if (w_bar == undefined) {
            w_bar = 0;
        }
        else {
            console.log("ERROR parsing object data returned from server. objectId: " + objectId);
            console.log("a " + a + " om " + om + " full_name " + full_name + " i " + i + " L " + L + " P " + P +
                " epoch " + epoch + " w " + w + " w_bar " + w_bar + " ma " + ma);
            return null;
        }
    }

    full_name = full_name.replace(/(\")+/g, "");

    var ephemeris = {full_name: full_name, ma: parseFloat(ma), epoch: parseFloat(epoch), a: parseFloat(a),
                        e: parseFloat(e), i: parseFloat(i), w_bar: parseFloat(w_bar), w: parseFloat(w),
                        L: parseFloat(L), om: parseFloat(om), P: parseFloat(P)};

    if (type == 'asteroid') {
        return {owner: owner, objectId: objectId, type: type, model: model, orbit: ephemeris, orbitExtras: orbitExtras};
    }
    else {
        var orbit = new Orbit3D(ephemeris,
            {
                color: rainbow(30, nextColor).getHex(), width: 1, jed: rSimulate.jed, object_size: 1.7,
                display_color: rainbow(30, nextColor),
                particle_geometry: rSimulate.cosmosScene.getParticleSystemGeometry(),
                name: full_name
            }, !rSimulate.cosmosRender.using_webgl);
        //console.log(nextColor);
        nextColor ++;
        return {owner: owner, objectId: objectId, type: type, model: model, orbit: orbit};
    }
}

function assignColor(data) {
    // {player: playerName, color: THREE.Color}
    var split = cleanObjectRequest(data);

    var playerName, color;
    for (var i = 0; i < split.length; i++) {
        var s = split[i];
        var next = i+1;
        if (s == 'player') {
            playerName = split[next];
        }
        else if (s == 'color') {
            color = split[next]
        }
    }

    // Ensure player is not already in list
    var exists = false;
    var players = rSimulate.cosmosScene.getPlayers();
    for (var ii = 0; ii < players.length; ii++) {
        if (players.player == playerName) exists = true;
    }

    if (!exists) {
        players.push({player: playerName, color: new THREE.Color(parseInt(color))});
        console.log(playerName+"'s", "color is", color);
    }
}

function claimResponder(data) {
    // {result: str, owner: str, objectId: str}
    var split = cleanObjectRequest(data);

    var result, owner, objectId;
    for (var i = 0; i < split.length; i++) {
        var s = split[i];
        var next = i + 1;
        if (s == 'result') result = split[next];
        else if (s == 'owner') owner = split[next];
        else if (s == 'objectId') objectId = split[next];
    }

    // check
    if (result == undefined || objectId == undefined || owner == undefined) {
        console.log("ERROR: Claim response from the server was malformed");
        console.log(result, objectId, owner);
        return;
    }

    if (result == 'accepted') rSimulate.cosmosScene.updateObjectOwnerById(owner, objectId);
    else console.log("player", owner, "tried to claim an asteroid, but", result);
}

function updateTime(data) {
    // {'jed': daysPassed, 'gec': str(month-year)}
    var split = cleanObjectRequest(data);

    var jedServer, dayServer, monthServer, yearServer;
    for (var i = 0; i < split.length; i++) {
        var s = split[i];
        var next = i + 1;
        if (s == 'jed') jedServer = split[next];
        else if (s == 'gec') {
            var gec = split[next];
            gec = gec.replace(/(-)+/g, " ");
            var gecSplit = gec.split(" ");
            dayServer = gecSplit[0];
            monthServer = gecSplit[1];
            yearServer = gecSplit[2];
        }
    }

    // check
    if (jedServer == undefined || dayServer == undefined || monthServer == undefined || yearServer == undefined) {
        console.log("ERROR: Time update response from server was malformed");
        console.log("jed", jedServer, "dayServer", dayServer, "monthServer", monthServer, "yearServer", yearServer);
        return;
    }

    // TODO: May have to change this to interpolate over time if it produces noticeable changes
    // For now, just do a hard-change to the client's jed
    rSimulate.cosmosRender.setJED(Math.floor(jedServer));
    rSimulate.cosmosUI.setDay(dayServer);
    rSimulate.cosmosUI.setMonth(monthServer);
    rSimulate.cosmosUI.setYear(yearServer);
}

function createBody(data) {
    //{'owner': ownerName, 'objectId': uuid.uuid4(), 'type': objectType, 'model': model, 'data': data}
    var body = parseObject(data);
    rSimulate.cosmosScene.addPlanet(body);
}

function parseNotifyRequest(data) {
    var phrase = data.trim();
    rSimulate.cosmosUI.notify(phrase);
}

function parseTraj(data) {
    "use strict";
    console.log(data);
    var split = cleanObjectRequest(data);
    console.log(split);
    var source, traj;
    for (var i = 0; i < split.length; i++) {
        var s = split[i];
        var next = i + 1;
        if (s == 'source') source = split[next];
        else if (s == 'traj') traj = split.slice(next);
    }

    if (source == undefined || traj == undefined) {
        console.log("ERROR: Trajectory recieved from server failed parsing");
        console.log("Source:", source, "Trajectory:",traj);
    }
    else {
        console.log('Source:', source, 'Trajectory:', traj);
        //rSimulate.cosmosUI.addTrajectory(source, traj);
    }
}

function parseMessage(m) {
    // interprets and carries out messages

    var cmd = m.split('"')[3];  // this should be right so long as "cmd" is listed first...
    var data = m.split(',"data":"')[1].slice(0, -2); // this assumes "data" is listed last

    if (cmd == "addToContent") {
        //prependContent(data)
        console.log("Server is trying to prepend content, and the prependContent function needs fixing before it will work");
    } else if (cmd == 'notify') {
        parseNotifyRequest(data);
    } else if (cmd == 'bodyCreate') {
        createBody(data);
    } else if (cmd == "updateResources") {
        updateResources(data)

    } else if (cmd == "researchCompleted") {
        // try sending update to techtree (only works if techtree is displayed)
        techtree.completeResearch(data);
        // TODO: add user notification?

    } else if (cmd == "addAsteroid") {
        var asteroid = parseObject(data);
        if (asteroid != null) {
            asteroid.orbit.name = asteroid.orbit.full_name.replace(/([\"])+/g, " ").trim();
            rSimulate.cosmosScene.addNewAsteroid(asteroid);
        }
        else {console.log("Parsing failed for unknown asteroid")}

    } else if (cmd == "pObjCreate") {
        var object = parseObject(data);
        if (object != null) {
            object.orbit.name = object.orbit.name.replace(/([\"])+/g, " ").trim();
            var path = getPathForModel(object.model.toLocaleLowerCase());

            if (path != null) {
                rSimulate.cosmosScene.addBlenderObjectMesh(path, object);
            }
            else {console.log("Could not find model path for object " + object.objectId)}
        }
        else {console.log("Parsing failed for unknown object")}

    } else if (cmd == "pObjRequest") {
        // TODO: display query template

    } else if (cmd == "pObjDestroyRequest") {
        var request = parseObjectRemoval(data);
        if (request.result == 'True') {
            rSimulate.cosmosScene.removeBody(undefined, "playerObject", request.objectId);
        }
        else {
            console.log("Destroy request for object " + request.objectId + " was denied because: " + request.reason);
        }
    } else if (cmd == "assignColor") {
        assignColor(data);
    } else if (cmd == "claim") {
        claimResponder(data);
    } else if (cmd == 'timeSync') {
        updateTime(data);
    } else if (cmd == 'trajReturn') {
        parseTraj(data);
    } else {
        console.log("ERR: unknown message to client: "+m);
    }
}