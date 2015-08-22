/**
 * Created by tylar on 8/22/15.
 */

(function(){
    var app = angular.module('webgl-directives', []);

    app.directive("shaders", function() {
        return {
            restrict: 'E',
            templateUrl: "directives/webGL/shaders.html"
        };
    });
    app.directive("mainScene", function() {
        return {
            restrict: 'E',
            templateUrl: "directives/webGL/main-scene.html"
        };
    });

})();