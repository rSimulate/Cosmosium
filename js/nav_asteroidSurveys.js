
var curSurvey = "";
var asteroidPollAmount = 0; // num of asteroids to poll, with 0 being all of the available asteroids

function updateSurvey(newSurvey) {
    // TODO: Adjust this to check for updated asteroid poll amount when we get a UI adjustment implemented
    if (curSurvey !== newSurvey) {
        curSurvey = newSurvey;
        rSimulate.cosmosScene.removeAsteroids();
        ws.send(message('getSurvey',"{'survey': '" + newSurvey + "', 'amt': " + asteroidPollAmount + "}"));
    }
}

document.getElementById('systemView-NEOs-link').addEventListener('click', function (e){
    e = e || window.event;

    switchContent();

    updateSurvey('NEO');

}, false);

document.getElementById('systemView-MainBelt-link').addEventListener('click', function (e){
    e = e || window.event;

    switchContent();

    updateSurvey('MainBelt');

}, false);

document.getElementById('systemView-trojan-link').addEventListener('click', function (e){
    e = e || window.event;

    switchContent();

    updateSurvey('SolarSystem');

}, false);

document.getElementById('systemView-PHO-link').addEventListener('click', function (e){
    e = e || window.event;

    switchContent();

    updateSurvey('KuiperBelt');

}, false);
