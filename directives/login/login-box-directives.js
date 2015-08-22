/**
 * Created by tylar on 8/22/15.
 */

(function(){
    var app = angular.module('login-box-directives', []);

    app.directive("loginBox", function() {
        return {
            restrict: 'E',
            templateUrl: "directives/login/login-box.html"
        };
    });
})();