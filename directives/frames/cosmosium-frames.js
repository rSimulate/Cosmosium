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
            templateUrl: "directives/frames/left-frame.html"
        };
    });
})();