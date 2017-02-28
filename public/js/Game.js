(function() {

    'use strict';

    var module = angular.module('space.wars.game', [
        'space.wars.common'
    ]);

    module.run(function(GameState, KeyBoard, $window) {

        GameState.localPlayer.x = $window.innerWidth/2 - GameState.localPlayer.r;
        GameState.localPlayer.y = $window.innerHeight/2 - GameState.localPlayer.r;
        GameState.localPlayer.bounds.x = $window.innerWidth/2 - GameState.localPlayer.bounds.r;
        GameState.localPlayer.bounds.y = $window.innerHeight/2 - GameState.localPlayer.bounds.r;

        var upHandler = KeyBoard.keyboard(87); //w
        upHandler.press = function() {
            GameState.localPlayer.dy -= 5;
        };
        upHandler.release = function() {
            GameState.localPlayer.dy += 5;
            GameState.localPlayer.accY = 0;
        };
        var downHandler = KeyBoard.keyboard(83); //s
        downHandler.press = function() {
            GameState.localPlayer.dy += 5;
            GameState.localPlayer.accY = 0;
        };
        downHandler.release = function() {
            GameState.localPlayer.dy -= 5;
            GameState.localPlayer.accY = 0;
        };
        var leftHandler = KeyBoard.keyboard(65);  //a
        leftHandler.press = function() {
            GameState.localPlayer.dx -= 5;
        };
        leftHandler.release = function() {
            GameState.localPlayer.dx += 5;
            GameState.localPlayer.accX = 0;
        };
        var rightHandler = KeyBoard.keyboard(68); //d
        rightHandler.press = function() {
            GameState.localPlayer.dx += 5;
        };
        rightHandler.release = function() {
            GameState.localPlayer.dx -= 5;
            GameState.localPlayer.accX = 0;
        };

        GameState.bgParts = [];
        for(let i = 0; i < 100; ++i) {
            GameState.bgParts.push({
                x: Math.random() * $window.innerWidth * 2,
                y: Math.random() * $window.innerHeight * 2,
                r: 2,

                reGenerate : function() {
                    if(this.x < 0) {
                        this.x = Math.random() * $window.innerWidth * 2;
                        this.y = Math.random() * $window.innerHeight * 2
                    }
                    if(this.x > $window.innerWidth) {
                        this.x = Math.random() * $window.innerWidth * 2;
                        this.y = Math.random() * $window.innerHeight * 2
                    }
                    if(this.y < 0) {
                        this.y = Math.random() * $window.innerHeight * 2;
                        this.x = Math.random() * $window.innerWidth * 2;
                    }
                    if(this.y > $window.innerHeight) {
                        this.y = Math.random() * $window.innerHeight * 2;
                        this.x = Math.random() * $window.innerWidth * 2;
                    }
                },

                repel : function(x, y) {
                    let distance = Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
                    if(distance < 20) {
                        this.y = Math.random() * $window.innerHeight * 2;
                        this.x = Math.random() * $window.innerWidth * 2;
                    }
                }
            });
        }
    });

    module.directive('game', function(GameState, PixiJs, KeyBoard) {
        return {
            restric: 'E',
            template : '<div></div>',
            scope : {
                nextState : '@'
            },
            link : function(scope, elm, attr) {
                scope.state = GameState.localPlayer;

                var renderer = PixiJs.renderer(elm);
                var stage = new PixiJs.pixi.Container();
                renderer.render(stage);

                var style = new PixiJs.pixi.TextStyle({
                    fontFamily: 'Arial',
                    fontSize: 36,
                    fontStyle: 'italic',
                    fontWeight: 'bold',
                    fill: ['#ffffff', '#00ff99'], // gradient
                    stroke: '#4a1850',
                    strokeThickness: 5,
                    dropShadow: true,
                    dropShadowColor: '#000000',
                    dropShadowBlur: 4,
                    dropShadowAngle: Math.PI / 6,
                    dropShadowDistance: 6,
                    wordWrap: true,
                    wordWrapWidth: 440
                });

                var textContainer = new PixiJs.pixi.Text('Smekt', style);
                textContainer.x = 30;
                textContainer.y = 180;
                stage.addChild(textContainer);

                var graphics = new PixiJs.pixi.Graphics();
                stage.addChild(graphics);

                PixiJs.pixi.loader.add('../img/ships.png')
                    .load(function() {
                        let texture = PixiJs.pixi.utils.TextureCache['../img/ships.png'];
                        texture.frame = new PixiJs.pixi.Rectangle(
                            0, // 5 * 64 ?
                            0, // 3 * 64 ?
                            64,
                            64);
                        let spaceship = new PixiJs.pixi.Sprite(texture);
                        spaceship.x = 500;
                        spaceship.y = 500;
                        spaceship.anchor.set(0.5);
                        stage.addChild(spaceship);

                        function gameLoop() {
                            requestAnimationFrame(gameLoop);
                            GameState.update(renderer);
                            GameState.render(
                                spaceship,
                                textContainer,
                                graphics,
                                stage,
                                renderer
                            );
                        }
                        gameLoop();

                    });
            }
        }
    });

})();

