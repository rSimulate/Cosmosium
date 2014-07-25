/*
 Ajax navigation controls for the sidebar.
*/

var openContent = $('#dash');

// jVectorMap for Launch Sites
var launchMap = new jvm.WorldMap({
    map: 'world_mill_en',
    container: $('#world-map'),
    backgroundColor: "#fff",
    regionStyle: {
        initial: {
            fill: '#e4e4e4',
            "fill-opacity": 1,
            stroke: 'none',
            "stroke-width": 0,
            "stroke-opacity": 1
        },
        hover: {
            fill: '#3b8bba'
        }
    },
    markers: [
        {latLng: [45.80, 63.20], name: 'Baikanur Cosmodrome'},
        {latLng: [27.30, -80.90], name: 'Cape Canaveral'},
        {latLng: [31.10, 130.97], name: 'Tanegashama Space Center'},
        {latLng: [36.59, -111.40], name: 'SpaceXs Spaceport America'}
    ]
});

// jVectorMap for Observatories
var observatoryMap = new jvm.WorldMap({
    map: 'world_mill_en',
    container: $('#observatory-world-map'),
    backgroundColor: "#fff",
    regionStyle: {
        initial: {
            fill: '#e4e4e4',
            "fill-opacity": 1,
            stroke: 'none',
            "stroke-width": 0,
            "stroke-opacity": 1
        },
        hover: {
            fill: '#3b8bba'
        }
    },
    markers: [
        {latLng: [45.80, 63.20], name: 'Baikanur Cosmodrome'},
        {latLng: [27.30, -80.90], name: 'Cape Canaveral'},
        {latLng: [31.10, 130.97], name: 'Tanegashama Space Center'},
        {latLng: [36.59, -111.40], name: 'SpaceXs Spaceport America'}
    ]
});


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

    switchContent($('#launchpad'));
    launchMap.setSize();
    
}, false);

document.getElementById('launchSys-link').addEventListener('click', function (e){
    e = e || window.event;
    
    //$('#content').load('/content?name=launchSys');
    
}, false);

document.getElementById('missionControl-link').addEventListener('click', function (e){
    e = e || window.event;

    switchContent($('#missionControl'));
    
}, false);

document.getElementById('observatories-link').addEventListener('click', function (e){
    e = e || window.event;

    switchContent($('#observatories'));
    observatoryMap.setSize();
    
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