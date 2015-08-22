/*
 Ajax navigation controls for the sidebar.
*/

$(document).ready(function(){



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
        rSimulate.cosmosRender.enableControls();
        if (content != undefined) {
            openContent = content;
            rSimulate.cosmosRender.disableControls();
            openContent.show();
        }
    }

    $('#asteroidSurveys-link').on('click', function (e){
        e = e || window.event;

        switchContent($('#asteroidSurveys'));

    }, false);

    $('#dash-link').on('click', function (e){
        e = e || window.event;

        switchContent($('#dash'));

    }, false);

    $('#fuelNet-link').on('click', function (e){
        e = e || window.event;

        switchContent($('#surveyEquip'));

    }, false);

    document.getElementById('gov-link').addEventListener('click', function (e){
        e = e || window.event;

        switchContent($('#surveyEquip'));

    }, false);

    document.getElementById('launchpad-link').addEventListener('click', function (e){
        e = e || window.event;

        switchContent($('#launchpad'));
        launchMap.setSize();

    }, false);

    document.getElementById('launchSys-link').addEventListener('click', function (e){
        e = e || window.event;

        switchContent($('#surveyEquip'));

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

        switchContent($('#surveyEquip'));

    }, false);

    document.getElementById('outreach-link').addEventListener('click', function (e){
        e = e || window.event;

        switchContent($('#surveyEquip'));

    }, false);

    document.getElementById('resMarket-link').addEventListener('click', function (e){
        e = e || window.event;

        switchContent($('#surveyEquip'));

    }, false);

    document.getElementById('research_spaceIndustry-link').addEventListener('click', function (e){
        e = e || window.event;

        switchContent($('#research'));

    }, false);
    document.getElementById('research_humanHabitation-link').addEventListener('click', function (e){
        e = e || window.event;

        switchContent($('#research'));

    }, false);
    document.getElementById('research_robotics-link').addEventListener('click', function (e){
        e = e || window.event;

        switchContent($('#research'));

    }, false);



    document.getElementById('spaceTourism-link').addEventListener('click', function (e){
        e = e || window.event;

        switchContent($('#surveyEquip'));

    }, false);

    document.getElementById('surveyEquip-link').addEventListener('click', function (e){
        e = e || window.event;

        switchContent($('#surveyEquip'));

    }, false);

    document.getElementById('systemView-link').addEventListener('click', function (e){
        e = e || window.event;
        switchContent();
    }, false);

    document.getElementById('timeline-link').addEventListener('click', function (e){
        e = e || window.event;

        switchContent($('#timeline'));

    }, false);

    document.getElementById('add-object-button').addEventListener('click', function (e) {
        e = e || window.event;

        if (rSimulate) rSimulate.cosmosScene.addTestObject();


    }, false);

    document.getElementById('destroy-object-button').addEventListener('click', function (e) {
        e = e || window.event;

        if (rSimulate) rSimulate.cosmosScene.requestRemoveBody();

    }, false);

    document.getElementById('set-target-button').addEventListener('click', function (e) {
        e = e || window.event;

        if (rSimulate) rSimulate.cosmosUI.setCourse(e);

    }, false);

    document.getElementById('plot-course-button').addEventListener('click', function (e) {
        e = e || window.event;

        if (rSimulate) rSimulate.cosmosUI.requestCourse(e);

    }, false);

    document.getElementById('cancel-course-button').addEventListener('click', function (e) {
        e = e || window.event;

        if (rSimulate) rSimulate.cosmosUI.cancelCourse(e);

    }, false);

});