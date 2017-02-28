(function() {

    'use strict';

    var module = angular.module('space.wars.common', []);

    module.service('PixiJs', function($window) {
        return {
            renderer : function(elm) {
                const renderer = PIXI.autoDetectRenderer(256, 256);
                renderer.view.style.position = "relative";
                renderer.view.style.display = "block";
                renderer.view.style.width = '100%';
                renderer.autoResize = true;
                renderer.resize($window.innerWidth, $window.innerHeight);
                elm.append(renderer.view);
                return renderer;
            },
            pixi : PIXI
        };
    });

    module.service('WebSocket', function() {
        const wsUri = 'ws://' + location.hostname  + ':' + location.port + '/ws/connect';
        const socket = new WebSocket(wsUri);
        socket.onopen = function(evt) { console.log("onopen", evt); };
        socket.onclose = function(evt) { console.log("onclose", evt);};
        socket.onerror = function(evt) { console.log("onerror", evt); };
        socket.onmessage = function(evt) {
            global.remotePlayers = JSON.parse(evt.data)['clients']
                .filter(function(client) {
                    return client.id !== global.localPlayer.id
                });
        };
        // FIXME add somewhere else.
        // setInterval(function() {
        //     socket.send(JSON.stringify(global.localPlayer));
        // }, 10);
        return socket;
    });

    module.service('KeyBoard', function($window) {
        return {
            keyboard: function(keyCode) {
                var key = {};
                key.code = keyCode;
                key.isDown = false;
                key.isUp = true;
                key.press = undefined;
                key.release = undefined;
                key.downHandler = function(event) {
                    if (event.keyCode === key.code) {
                        if (key.isUp && key.press) key.press();
                        key.isDown = true;
                        key.isUp = false;
                    }
                    event.preventDefault();
                };
                key.upHandler = function(event) {
                    if (event.keyCode === key.code) {
                        if (key.isDown && key.release) key.release();
                        key.isDown = false;
                        key.isUp = true;
                    }
                    event.preventDefault();
                };
                $window.addEventListener(
                    "keydown", key.downHandler.bind(key), false
                );
                $window.addEventListener(
                    "keyup", key.upHandler.bind(key), false
                );
                return key;
            }
        };
    });

    module.value('GameState', {
        localPlayer : {
            id: retrieveClientId(),
            r : 10,
            dx: 0,
            dy: 0,
            accX: 0,
            accY: 0,
            x: 500,
            y: 500,
            _x: 500,
            _y: 500,
            alpha: 0,
            direction: 0,
            moving : false,
            bounds: { x: 500, y: 500, r: 400 }
        },
        bgParts : [],
        remotePlayers : [],
        _updateAcc : function(self) {
            if(self.localPlayer.dx < 0) {
                self.localPlayer.accX -= (self.localPlayer.dx * self.localPlayer.dx) / 100;
            } else {
                self.localPlayer.accX += (self.localPlayer.dx * self.localPlayer.dx) / 100;
            }
            if(self.localPlayer.dy < 0) {
                self.localPlayer.accY -= (self.localPlayer.dy * self.localPlayer.dy) / 100;
            } else {
                self.localPlayer.accY += (self.localPlayer.dy * self.localPlayer.dy) / 100;
            }
        },
        _updateGlobalPos: function (self) {
            self.localPlayer._x += self.localPlayer.dx + self.localPlayer.accX;
            self.localPlayer._y += self.localPlayer.dy + self.localPlayer.accY;
        },
        _updateBackgroundParts: function(self) {
            self.bgParts.forEach(function(p) {
                p.repel(self.localPlayer.x, self.localPlayer.y);
            });
        },
        _updateIfMovingLeft : function(self) {
            if(self.localPlayer.dx < 0) {
                if(self.localPlayer.x - self.localPlayer.r > self.localPlayer.bounds.x) {
                    self.localPlayer.x += self.localPlayer.dx + self.localPlayer.accX;
                    self.localPlayer.direction = -45;
                } else {
                    self.bgParts.forEach(function(p) {
                        p.x += (self.localPlayer.dx + self.localPlayer.accX) * -1;
                        p.reGenerate();
                    });
                }
            }
        },
        _updateIfMovingRight : function(self) {
            if(self.localPlayer.dx > 0) {
                if((self.localPlayer.x + self.localPlayer.r * 2) < (self.localPlayer.bounds.x + (self.localPlayer.bounds.r) * 2)) {
                    self.localPlayer.x += self.localPlayer.dx + self.localPlayer.accX;
                    self.localPlayer.direction = 45;
                } else {
                    self.bgParts.forEach(function(p) {
                        p.x += (self.localPlayer.dx + self.localPlayer.accX) * -1;
                        p.reGenerate();
                    });
                }
            }
        },
        _updateIfMovingUp : function(self) {
            self.localPlayer.direction = 0;
            if(self.localPlayer.dy < 0) {
                if(self.localPlayer.y - self.localPlayer.r * 2 > self.localPlayer.bounds.y) {
                    self.localPlayer.y += self.localPlayer.dy + self.localPlayer.accY;
                } else {
                    self.bgParts.forEach(function(p) {
                        p.y += (self.localPlayer.dy + self.localPlayer.accY) * -1;
                        p.reGenerate();
                    });
                }
            }
        },
        _updateIfMovingDown : function(self) {
            if(self.localPlayer.dy > 0) {
                if((self.localPlayer.y + self.localPlayer.r * 2)  < (self.localPlayer.bounds.y + (self.localPlayer.bounds.r * 2))) {
                    self.localPlayer.y += self.localPlayer.dy + self.localPlayer.accY;
                } else {
                    self.bgParts.forEach(function(p) {
                        p.y += (self.localPlayer.dy + self.localPlayer.accY) * -1;
                        p.reGenerate();
                    });
                }
            }
        },
        _updateDirection : function(self) {
            let x0 = self.localPlayer.x;
            let y0 = self.localPlayer.y;
            let x1 = x0 + (self.localPlayer.dx + self.localPlayer.accX);
            let y1 = y0 + (self.localPlayer.dy + self.localPlayer.accY) ;

            self.localPlayer.direction = Math.atan(y1/x1);
        },
        update : function() {
            var self = this;
            self._updateAcc(self);
            self._updateGlobalPos(self);
            self._updateBackgroundParts(self);
            self._updateIfMovingLeft(self);
            self._updateIfMovingRight(self);
            self._updateIfMovingUp(self);
            self._updateIfMovingDown(self);
            self._updateDirection(self);
        },
        render : function(spaceship, textContainer, graphics, stage, renderer) {
            graphics.clear();
            textContainer.x = this.localPlayer.bounds.x + this.localPlayer.bounds.r * 2;
            textContainer.y = this.localPlayer.bounds.y - 40;
            textContainer.text = "[" + this.localPlayer._x + ", " + this.localPlayer._y + "]";
            this.bgParts.forEach(function(p) {
                graphics.beginFill(0x3498db);
                graphics.drawEllipse(p.x, p.y, p.r, p.r);
                graphics.endFill();
            });
            var self = this;
            self.remotePlayers.forEach(function(c) {
                self._renderPlayer(graphics, c, 0xAAAAAA);
            });

            spaceship.x = this.localPlayer.x;
            spaceship.y = this.localPlayer.y;
            spaceship.rotation = this.localPlayer.direction;

            renderer.render(stage);
        },
        _renderPlayer : function _renderPlayer(graphics, client, color) {
            graphics.beginFill(color);
            console.log(client);
            graphics.drawRect(client.x, client.y, client.r * 2, client.r * 2);
            graphics.endFill();
        }

    });

    //FIXME!
    document.cookie = "id=" + retrieveClientId();

    function retrieveClientId() {
        var key = ".$.";
        var savedId = localStorage.getItem(key);
        if(savedId) {
            return savedId;
        } else {
            let name = "client" + (parseInt(Math.random() * 1000));
            localStorage.setItem(key, name);
            return name;
        }
    }

})();