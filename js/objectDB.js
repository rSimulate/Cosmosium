
var rel = $('script[src*=objectDB]').attr('src');
var models = list();
models.append(rel.replace('objectDB.js', "../models/Magellan_16.dae"));

function getPathForModel(model) {
    for (var m in models) {
        if (m == model) {
            return m;
        }
    }

    return null;
}