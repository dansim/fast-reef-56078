(function() {

    'use strict';

    var module = angular.module('space.wars.common', []);

    module.service('PixiJs', function($window) {
        return {
            renderer : function(elm) {

                var renderer = PIXI.autoDetectRenderer(256, 256);

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
                //The `downHandler`
                key.downHandler = function(event) {
                    if (event.keyCode === key.code) {
                        if (key.isUp && key.press) key.press();
                        key.isDown = true;
                        key.isUp = false;
                    }
                    event.preventDefault();
                };
                //The `upHandler`
                key.upHandler = function(event) {
                    if (event.keyCode === key.code) {
                        if (key.isDown && key.release) key.release();
                        key.isDown = false;
                        key.isUp = true;
                    }
                    event.preventDefault();
                };

                //Attach event listeners
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
            dx: 0,
            dy: 0,
            accX: 0,
            accY: 0,
            x: 500,
            y: 500,

            alpha: 0,
            moving : false,
            //
            bounds: {
                x: 500,
                y: 500,
                r: 400
            }
        },
        bgParts : [],
        remotePlayers : [],
        r : 10,
        update : function(input) {

            console.log(input);

            var self = this;

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

            self.bgParts.forEach(function(p) {
                p.repel(self.localPlayer.x, self.localPlayer.y);
            });

            if(self.localPlayer.dx < 0) {
               if(self.localPlayer.x - self.r > self.localPlayer.bounds.x) {
                   self.localPlayer.x += self.localPlayer.dx + self.localPlayer.accX;
               } else {
                   self.bgParts.forEach(function(p) {
                       p.x += (self.localPlayer.dx + self.localPlayer.accX) * -1;
                       p.reGenerate();
                   });
               }
            }
            if(self.localPlayer.dx > 0) {
                if((self.localPlayer.x + self.r * 2) < (self.localPlayer.bounds.x + (self.localPlayer.bounds.r) * 2)) {
                    self.localPlayer.x += self.localPlayer.dx + self.localPlayer.accX;
                } else {
                    self.bgParts.forEach(function(p) {
                        p.x += (self.localPlayer.dx + self.localPlayer.accX) * -1;
                        p.reGenerate();
                    });
                }
            }
            if(self.localPlayer.dy < 0) {
                if(self.localPlayer.y - self.r * 2 > self.localPlayer.bounds.y) {
                    self.localPlayer.y += self.localPlayer.dy + self.localPlayer.accY;
                } else {
                    self.bgParts.forEach(function(p) {
                        p.y += (self.localPlayer.dy + self.localPlayer.accY) * -1;
                        p.reGenerate();
                    });
                }
            }
            if(self.localPlayer.dy > 0) {
                if((self.localPlayer.y + self.r * 2)  < (self.localPlayer.bounds.y + (self.localPlayer.bounds.r * 2))) {
                    self.localPlayer.y += self.localPlayer.dy + self.localPlayer.accY;
                } else {
                    self.bgParts.forEach(function(p) {
                        p.y += (self.localPlayer.dy + self.localPlayer.accY) * -1;
                        p.reGenerate();
                    });
                }
            }
        },
        render : function(graphics, stage, renderer) {
            graphics.clear();

            this.bgParts.forEach(function(p) {
                //
                // graphics.beginFill(0xFFFFFF);
                // graphics.drawRect(p.x, p.y, p.r * 2, p.r * 2);
                // graphics.endFill();

                graphics.beginFill(0x3498db); // Blue
                graphics.drawEllipse(p.x, p.y, p.r, p.r); // drawEllipse(x, y, width, height)
                graphics.endFill();

            });

            var self = this;
            self.remotePlayers.forEach(function(c) {
                self._renderPlayer(graphics, c, 0xAAAAAA);
            });

            //cCtx.fillText(name, x - global.r, y - global.r );
            self._renderPlayer(graphics, this.localPlayer, 0x00AAFF);

            // //Bounds (DEBUG)
            // let bounds = this.localPlayer.bounds;
            // graphics.lineStyle(5, 0x666666);
            // graphics.drawRect(bounds.x, bounds.y, bounds.r * 2, bounds.r * 2);

            renderer.render(stage);
        },
        _renderPlayer : function _renderPlayer(graphics, client, color) {
            let x = client.x;
            let y = client.y;
            let name = client.id;

            // let angle = client.alpha * Math.PI / 180;
            // let xAngle = Math.cos(angle);
            // let yAngle = Math.sin(angle);
            // let x0 = x + this.r;
            // let y0 = y + this.r;
            // let r  = 20;
            // let x1 = x0 + (r * xAngle);
            // let y1 = y0 + (r * yAngle);

            // /** render aim **/
            // graphics.lineStyle(5, 0xFFFFFF);
            // graphics.moveTo(x, y);
            // graphics.lineTo(this.x_p, this.y_p);
            // //cCtx.fillText(c.id, c.x - global.r, c.y - global.r );

            graphics.beginFill(color);
            graphics.drawRect(client.x, client.y, this.r * 2, this.r * 2);
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