(function() {

    'use strict';

    var module = angular.module('space.wars.game', [
        'space.wars.common'
    ]);

    module.directive('game', function(GameState, PixiJs, KeyBoard) {
        return {
            restric: 'E',
            template : '<h1 class="lead">Game</h1><a data-ui-sref="{{nextState}}">HighScore</a>',
            scope : {
                nextState : '@'
            },
            link : function(scope, elm, attr) {
                var renderer = PixiJs.renderer(elm);

                var stage = new PixiJs.pixi.Container();
                renderer.render(stage);

                var graphics = new PixiJs.pixi.Graphics();
                stage.addChild(graphics);

                //game loop
                function gameLoop() {
                    requestAnimationFrame(gameLoop);
                    GameState.update();
                    GameState.render(graphics);
                    renderer.render(stage);
                }

                var upHandler = KeyBoard.keyboard(119); //w
                upHandler.press = function() {
                    console.log("UP!");
                    GameState.localPlayer.y -= 5;
                };
                upHandler.release = function() {};

                var downHandler = KeyBoard.keyboard(115); //s
                downHandler.press = function() {
                    GameState.localPlayer.y += 5;
                };
                downHandler.release = function() {};

                var leftHandler = KeyBoard.keyboard(97);  //a
                leftHandler.press = function() {
                    GameState.localPlayer.x -= 5;
                };
                leftHandler.release = function() {};

                var rightHandler = KeyBoard.keyboard(100); //d
                rightHandler.press = function() {
                    GameState.localPlayer.x += 5;
                };
                rightHandler.release = function() {};

                gameLoop();


                // window.onmousemove = function(evt) {
                //     let x = evt.screenX;
                //     let y = evt.screenY;
                //     GameState.updateAlpha(x, y);
                // };
                //
                // window.onkeydown = function(evt) {
                //     if(GameState.localPlayer.alpha > 360) {
                //         GameState.localPlayer.alpha = 0;
                //     }
                //     if(GameState.localPlayer.alpha < 0) {
                //         GameState.localPlayer.alpha = 360;
                //     }
                //
                //     if(evt.key === 'w') {
                //         GameState.localPlayer.moving = true;
                //     }
                // };
                //
                // window.onkeyup = function(evt) {
                //     if(evt.key === 'w') {
                //         GameState.localPlayer.moving = false;
                //     }
                // };


            }
        }
    });
})();

