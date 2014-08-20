

function cleanOrbitName(str) {
    var textName = str.replace(/(_)+/g, " ");
    textName = textName.replace(/(--)+/g, "\'");

    return textName;
}

rainbow = function(numOfSteps, step) {
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
};





function getFocalDepth(distanceFromCamera) {
    var zfar = camera.far;
    var znear = camera.near;
    var saturate = Math.max(0, Math.min(1, (distanceFromCamera - znear) / (zfar - znear)));
    var smooth = saturate * saturate * (3 - 2 * saturate);
    var sdist = 1-smooth;
    return -zfar * znear / (sdist * (zfar - znear) - zfar);
}

function getColorForOwner(players, owner) {
    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        if (player.player == owner) return player.color;
    }
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function asteroidIsOwned(asteroid) {
    return (Math.random() > 0.5);
}

