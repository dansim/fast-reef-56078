(function() {

    'use strict';

    var module = angular.module('space.wars', [
        'ui.router',
        'ngAnimate',
        'space.wars.splash',
        'space.wars.game',
        'space.wars.highscore'
    ]);

    module.run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }]);

    module.config(['$stateProvider', '$urlRouterProvider', function($stateProvider,   $urlRouterProvider) {
        $urlRouterProvider
            .otherwise('/');
        $stateProvider
            .state("splash", {
                url: "/",
                template: '<splash next-state="game"></splash>'
            })
            .state("game", {
                url: "/",
                template: '<game next-state="highscore"></game>'
            })
            .state("highscore", {
                url: "/",
                template: '<high-score next-state="splash"></high-score>'
            })
    }]);

})();
