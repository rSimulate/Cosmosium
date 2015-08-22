/**
 * Created by tylar on 8/22/15.
 */
(function(){
    var app = angular.module('game-directives', []);

    app.directive("resourceBar", function() {
        return {
            restrict: 'E',
            templateUrl: "directives/gameModules/resource-bar.html"
        };
    });
})();