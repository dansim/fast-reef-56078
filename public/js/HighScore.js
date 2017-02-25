(function () {

    'use strict';

    var module = angular.module('space.wars.highscore', []);

    module.directive('highScore', function() {
        return {
            restric: 'E',
            template : '<h1 class="lead">HighScore</h1><a data-ui-sref="{{nextState}}">Restart</a>',
            scope : {
                nextState : '@'
            },
            link: function(scope, elm, attr) {}
        }
    });

})();