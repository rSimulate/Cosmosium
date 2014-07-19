
var models = [];

var magellan = {model: 'magellan', path: "/models/Magellan/magellan.dae"};

models.push(magellan);

function getPathForModel(model) {
    for (var i = 0; i < models.length; i++) {
        if (models[i].model == model) {
            return models[i].path;
        }
    }

    return null;
}