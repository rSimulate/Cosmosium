
var rel = $('script[src*=objectDB]').attr('src');
var models = list();

var magellan = {model: 'magellan', path: rel.replace('objectDB.js', "../models/Magellan_16.dae")};

models.append(magellan);

function getPathForModel(model) {
    for (var obj in models) {
        if (obj.model == model) {
            return obj.path;
        }
    }

    return null;
}