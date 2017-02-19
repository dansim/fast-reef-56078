(function() {

    const global = {
        localPlayer : {
            x: 500,
            y: 500,
            aim: {
                angle: 0,
                lineLength : 100
            }
        },
        remotePlayers : []
    };

    var moving = false;

    window.onkeydown = function(evt) {
        if(evt.key === 'ArrowRight') {
            global.localPlayer.aim.angle = global.localPlayer.aim.angle + 5;
        }
        if(evt.key === 'ArrowLeft') {
            global.localPlayer.aim.angle = global.localPlayer.aim.angle - 5;
        }
        if(global.localPlayer.aim.angle > 360) {
            global.localPlayer.aim.angle = 0;
        }
        if(global.localPlayer.aim.angle < 0) {
            global.localPlayer.aim.angle = 360;
        }

        if(evt.key === 'w') {
            moving = true;
        }
    };

    window.onkeyup = function(evt) {
        if(evt.key === 'w') {
            moving = false;
        }
    };

    function retrieveClientId() {
        var key = "*----------------------------------------------------------*";
        var savedId = localStorage.getItem(key);
        if(savedId) {
            global.localPlayer.name = savedId.split("=") [1];
            return savedId;
        } else {
            let name = "client" + (parseInt(Math.random() * 1000));
            global.localPlayer.name = name;
            var newId = "clientId=" + name;
            localStorage.setItem(key, newId);
            return newId;
        }
    }

    function initCanvas () {

        var cElm = document.getElementById("main_c");
        cElm.width = document.body.clientWidth;
        cElm.height = document.body.clientHeight;

        var width = cElm.width;
        var height = cElm.height;

        var offsetFunc = function() {
            cElm.width = cElm.offsetWidth;
            cElm.height = cElm.offsetHeight;
        };

        window.onload = offsetFunc;
        window.onresize = offsetFunc;

        var cCtx = cElm.getContext("2d");
        return function (data) {

            cCtx.fillStyle='#000000';
            cCtx.fillRect(0, 0, width, height);

            var d = { r: 10 };

            cCtx.fillStyle = '#00FFFF';
            global.remotePlayers.forEach(function(c) {
                cCtx.fillText(c.clientId, c.clientX - d.r, c.clientY - d.r );
                cCtx.fillRect(c.clientX, c.clientY, d.r * 2, d.r * 2);
            });

            /** player **/
            let x = global.localPlayer.x;
            let y = global.localPlayer.y;
            let name = global.localPlayer.name;

            /** aim **/
            let angle = global.localPlayer.aim.angle * Math.PI / 180;
            let xAngle = Math.cos(angle);
            let yAngle = Math.sin(angle);
            let x0 = x + d.r;
            let y0 = y + d.r;
            let r  = 20;
            let x1 = x0 + (r * xAngle);
            let y1 = y0 + (r * yAngle);

            /** render aim **/
            cCtx.beginPath();
            cCtx.strokeStyle = '#FFFFFF';
            cCtx.lineWidth = 5;
            cCtx.moveTo(x0, y0);
            cCtx.lineTo(x1, y1);
            cCtx.stroke();

            /** render player **/
            cCtx.fillStyle = '#00AAFF';
            cCtx.fillText(name, x - d.r, y - d.r );
            cCtx.fillRect(x, y, d.r * 2, d.r * 2);

        };
    }

    function initWsConnection(renderFunc) {

        const wsUri = 'ws://' + location.hostname  + ':' + location.port + '/ws/connect';
        const socket = new WebSocket(wsUri);

        socket.onopen = function(evt) {
            console.log("onopen", evt);
        };

        socket.onclose = function(evt) {
            console.log("onclose", evt);
        };

        socket.onmessage = function(evt) {
            global.remotePlayers = JSON.parse(evt.data)['clients']
                .filter(function(client) {
                    return client.clientId !== global.localPlayer.name
                });
        };

        socket.onerror = function(evt) {
            console.log("onerror", evt);
        };

        /*
         * Init render
         */
        setTimeout(function () {

            renderFunc();

            /*
             * reporting of position
             */
            setInterval(function() {
                socket.send(JSON.stringify({
                    clientX : global.localPlayer.x,
                    clientY : global.localPlayer.y
                }));
            }, 10);

            setInterval(function() {
                if(moving) {
                    let angle = global.localPlayer.aim.angle * Math.PI / 180;
                    let xAngle = Math.cos(angle);
                    let yAngle = Math.sin(angle);
                    let velocity = 5;
                    dy = yAngle * velocity;
                    dx = xAngle * velocity;
                } else {
                    dy = 0;
                    dx = 0;
                }
                global.localPlayer.x += dx;
                global.localPlayer.y += dy;
                renderFunc();

            }, 10);

        }, 10);

    }

    document.cookie = retrieveClientId();

    initWsConnection(initCanvas());

})();
