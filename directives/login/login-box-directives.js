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

    app.directive("demoLogin", function(){
        return {
            restrict: 'E',
            templateUrl: "directives/login/demo-login.html"
        }
    });

    app.directive("socialLogin", function(){
       return {
           restrict: 'E',
           templateUrl: "directives/login/social-login.html"
       }
    });

    app.directive("betaLogin", function(){
        return {
            restrict: 'E',
            templateUrl: "directives/login/beta-login.html"
        }
    });

    app.directive("betaSignup", function(){
        return {
            restrict: 'E',
            templateUrl: "directives/login/beta-signup.html"
        }
    });
})();