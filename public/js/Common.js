(function() {

    'use strict';

    var module = angular.module('space.wars.common', []);

    module.service('PixiJs', function() {
        return {
            renderer : function(elm) {
                var renderer = PIXI.autoDetectRenderer(256, 256);
                renderer.view.style.position = "absolute";
                renderer.view.style.display = "block";
                renderer.autoResize = true;
                renderer.resize(window.innerWidth, window.innerHeight);
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


    module.service('KeyBoard', function() {
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
                window.addEventListener(
                    "keydown", key.downHandler.bind(key), false
                );
                window.addEventListener(
                    "keyup", key.upHandler.bind(key), false
                );
                return key;
            }
        };
    });

    module.value('GameState', {
        localPlayer : {
            id: retrieveClientId(),
            x: 500,
            y: 500,
            x_p: 500,
            y_p: 500,
            alpha: 0,
            moving : false
        },
        remotePlayers : [],
        r : 10,
        updateAlpha : function(x, y) {
            this.x_p = x;
            this.y_p = y;
        },
        update : function() {
            var dx, dy;
            if(this.localPlayer.moving) {
                let angle = this.localPlayer.alpha * Math.PI / 180;
                let xAngle = Math.cos(angle);
                let yAngle = Math.sin(angle);
                let velocity = 5;
                dy = yAngle * velocity;
                dx = xAngle * velocity;
            } else {
                dy = 0;
                dx = 0;
            }
            this.localPlayer.x += dx;
            this.localPlayer.y += dy;
        },
        render : function(graphics) {
            var self = this;
            graphics.clear();
            self.remotePlayers.forEach(function(c) {
                self._renderPlayer(graphics, c, 0xFFFFFF);
            });
            //cCtx.fillText(name, x - global.r, y - global.r );
            self._renderPlayer(graphics, this.localPlayer, 0x00AAFF);
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

            /** render aim **/
            graphics.lineStyle(5, 0xFFFFFF);
            graphics.moveTo(x, y);
            graphics.lineTo(this.x_p, this.y_p);
            //cCtx.fillText(c.id, c.x - global.r, c.y - global.r );

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