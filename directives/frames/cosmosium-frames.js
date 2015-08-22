/**
 * Created by tylar on 8/22/15.
 */

(function(){
    var app = angular.module('cosmosium-frames', []);

    app.directive("topFrame", function() {
        return {
            restrict: 'E',
            templateUrl: "directives/frames/top-frame.html"
        };
    });
    app.directive("leftFrame", function() {
        return {
            restrict: 'E',
            templateUrl: "directives/frames/left-frame.html",
            controller: ['$scope', function ($scope) {

                // init:

                /* Sidebar tree view */
                $(".sidebar .treeview").tree();

                document.getElementById('asteroidSurveys-link').addEventListener('click', function (e){
                    e = e || window.event;

                    console.log('asteroid surveys clicked!')
                    switchContent($('#asteroidSurveys'));

                }, false);

                document.getElementById('dash-link').addEventListener('click', function (e){
                    e = e || window.event;

                    switchContent($('#dash'));

                }, false);

                document.getElementById('fuelNet-link').addEventListener('click', function (e){
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

            }]
        };
    });
})();