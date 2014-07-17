
var rel = $('script[src*=objectDB]').attr('src');
var models = [];

var magellan = {model: 'magellan', path: rel.replace('objectDB.js', "../models/Magellan_16.dae")};

models.push(magellan);

function getPathForModel(model) {
    for (var i = 0; i < models.length; i++) {
        console.log("MODEL STORED: " + models[i].model + " Cur: " + model);
        if (models[i].model == model) {
            return models[i].path;
        }
    }

    return null;
}