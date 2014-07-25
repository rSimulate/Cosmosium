/*
 Ajax navigation controls for the sidebar.
*/

var openContent = $('#dash');

function switchContent(content) {
    openContent.hide();
    controls.enabled = true;
    if (content != undefined) {
        openContent = content;
        controls.enabled = false;
        openContent.show();
    }
}

document.getElementById('asteroidSurveys-link').addEventListener('click', function (e){
    e = e || window.event; 
    //$('#content').load('/content?name=asteroidSurveys');

}, false);

document.getElementById('dash-link').addEventListener('click', function (e){
    e = e || window.event;

    switchContent($('#dash'));
    
}, false);

document.getElementById('fuelNet-link').addEventListener('click', function (e){
    e = e || window.event;
    //$('#content').load('/content?name=fuelNet');
}, false);

document.getElementById('gov-link').addEventListener('click', function (e){
    e = e || window.event;
    //$('#content').load('/content?name=gov');
}, false);

document.getElementById('launchpad-link').addEventListener('click', function (e){
    e = e || window.event;
    
    //$('#content').load('/content?name=launchpad');
    
}, false);

document.getElementById('launchSys-link').addEventListener('click', function (e){
    e = e || window.event;
    
    //$('#content').load('/content?name=launchSys');
    
}, false);

document.getElementById('missionControl-link').addEventListener('click', function (e){
    e = e || window.event;
    
    //$('#content').load('/content?name=missionControl');
    
}, false);

document.getElementById('observatories-link').addEventListener('click', function (e){
    e = e || window.event;
    
    //$('#content').load('/content?name=observatories');
    
}, false);

document.getElementById('org-link').addEventListener('click', function (e){
    e = e || window.event;
    //$('#content').load('/content?name=org');
}, false);

document.getElementById('outreach-link').addEventListener('click', function (e){
    e = e || window.event;
    //$('#content').load('/content?name=outreach');
}, false);

document.getElementById('resMarket-link').addEventListener('click', function (e){
    e = e || window.event;
    
    //$('#content').load('/content?name=resMarket');
    
}, false);

document.getElementById('research_spaceIndustry-link').addEventListener('click', function (e){
    e = e || window.event;
    //$('#content').load('/content?name=research&section=spaceIndustry');
}, false);
document.getElementById('research_humanHabitation-link').addEventListener('click', function (e){
    e = e || window.event;
    //$('#content').load('/content?name=research&section=humanHabitation');
}, false);
document.getElementById('research_robotics-link').addEventListener('click', function (e){
    e = e || window.event;
    //$('#content').load('/content?name=research&section=roboticsAndAI');
}, false);



document.getElementById('spaceTourism-link').addEventListener('click', function (e){
    e = e || window.event;
    //$('#content').load('/content?name=spaceTourism');
}, false);

document.getElementById('surveyEquip-link').addEventListener('click', function (e){
    e = e || window.event;
    //$('#content').load('/content?name=surveyEquip');

}, false);

document.getElementById('systemView-link').addEventListener('click', function (e){
    e = e || window.event;
    switchContent();
}, false);

document.getElementById('timeline-link').addEventListener('click', function (e){
    e = e || window.event;
    
    $('#content').load('/content?name=timeline');
    
}, false);

document.getElementById('add-object-button').addEventListener('click', function (e) {
    e = e || window.event;

    addTestObject();

}, false);