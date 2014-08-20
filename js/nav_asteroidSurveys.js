document.getElementById('systemView-NEOs-link').addEventListener('click', function (e){
    e = e || window.event;

    switchContent();

    rSimulate.cosmosScene.removeAsteroids();
    ws.send(message('getSurvey',"{'survey': 'NEO', 'amt': 0}"));

}, false);

document.getElementById('systemView-MainBelt-link').addEventListener('click', function (e){
    e = e || window.event;

    switchContent();

    rSimulate.cosmosScene.removeAsteroids();
    ws.send(message('getSurvey',"{'survey': 'MainBelt', 'amt': 0}"));

}, false);

document.getElementById('systemView-trojan-link').addEventListener('click', function (e){
    e = e || window.event;

    switchContent();

    rSimulate.cosmosScene.removeAsteroids();
    ws.send(message('getSurvey',"{'survey': 'SolarSystem', 'amt': 0}"));

}, false);

document.getElementById('systemView-PHO-link').addEventListener('click', function (e){
    e = e || window.event;

    switchContent();

    rSimulate.cosmosScene.removeAsteroids();
    ws.send(message('getSurvey',"{'survey': 'KuiperBelt', 'amt': 0}"));

}, false);
