(function() {

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

    document.cookie = "id=" + retrieveClientId();

    const global = {
        localPlayer : {
            id: retrieveClientId(),
            x: 500,
            y: 500,
            alpha: 0,
            moving : false
        },
        remotePlayers : [],
        r : 10
    };

    var renderer = PIXI.autoDetectRenderer(256, 256);
    renderer.view.style.position = "absolute";
    renderer.view.style.display = "block";
    renderer.autoResize = true;
    renderer.resize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.view);

    var stage = new PIXI.Container();
    renderer.render(stage);

    var graphics = new PIXI.Graphics();
    stage.addChild(graphics);

    function gameLoop() {
        //Loop this function at 60 frames per second
        requestAnimationFrame(gameLoop);

        var dx, dy;
        if(global.localPlayer.moving) {
            let angle = global.localPlayer.alpha * Math.PI / 180;
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


        graphics.clear();

        global.remotePlayers.forEach(function(c) {
            _renderPlayer(graphics, c, 0xFFFFFF);
        });

        /** render player **/
        //cCtx.fillText(name, x - global.r, y - global.r );
        _renderPlayer(graphics, global.localPlayer, 0x00AAFF);

        renderer.render(stage);
    }

    function _renderPlayer(graphics, client, color) {
        /** player **/
        let x = client.x;
        let y = client.y;
        let name = client.id;

        /** aim **/
        let angle = client.alpha * Math.PI / 180;
        let xAngle = Math.cos(angle);
        let yAngle = Math.sin(angle);
        let x0 = x + global.r;
        let y0 = y + global.r;
        let r  = 20;
        let x1 = x0 + (r * xAngle);
        let y1 = y0 + (r * yAngle);

        /** render aim **/
        graphics.lineStyle(5, 0xFFFFFF);
        graphics.moveTo(x0, y0);
        graphics.lineTo(x1, y1);


        //cCtx.fillText(c.id, c.x - global.r, c.y - global.r );
        graphics.beginFill(color);
        graphics.drawRect(client.x, client.y, global.r * 2, global.r * 2);
        graphics.endFill();
    }

    window.onkeydown = function(evt) {
        if(evt.key === 'ArrowRight') {
            global.localPlayer.alpha = global.localPlayer.alpha + 5;
        }
        if(evt.key === 'ArrowLeft') {
            global.localPlayer.alpha = global.localPlayer.alpha - 5;
        }
        if(global.localPlayer.alpha > 360) {
            global.localPlayer.alpha = 0;
        }
        if(global.localPlayer.alpha < 0) {
            global.localPlayer.alpha = 360;
        }

        if(evt.key === 'w') {
            global.localPlayer.moving = true;
        }
    };

    window.onkeyup = function(evt) {
        if(evt.key === 'w') {
            global.localPlayer.moving = false;
        }
    };

    function initWsConnection(renderFunc) {
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
        setInterval(function() {
            socket.send(JSON.stringify(global.localPlayer));
        }, 10);
    }

    initWsConnection();
    gameLoop();

})();
