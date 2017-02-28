(function () {

    'use strict';

    var module = angular.module('space.wars.splash', []);

    module.directive('splash', function($state, $interval) {

        return {
            restric: 'E',
            template : '<p style="text-align:center; position:absolute; top:0; bottom:0; width: 100%; background-color:black; color:whitesmoke; margin:auto; font-size: 40em;"> {{ countDown }} </p>',
            scope : {
                nextState : '@'
            },
            link: function(scope, elm, attr) {
                scope.countDown = 2;
                var int = $interval(function() {
                    if(scope.countDown == 1) {
                        $interval.cancel(int);
                        $state.go(scope.nextState);
                    } else {
                        scope.countDown -= 1;
                    }
                }, 1000);
            }
        }
    });

})();