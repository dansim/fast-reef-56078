(function() {

    const state = {
        x: Math.random() * 400,
        y: Math.random() * 400
    };

    var
        dx = 0,
        dy = 0;

    document.onkeydown = function(evt) {
        if(evt.key === 'w') { dy -= 0.2; }
        if(evt.key === 's') { dy += 0.2; }
        if(evt.key === 'a') { dx -= 0.2; }
        if(evt.key === 'd') { dx += 0.2; }
    };

    document.onkeyup = function(evt) {
        if(evt.key === 'w') { dy = 0; }
        if(evt.key === 's') { dy = 0; }
        if(evt.key === 'a') { dx = 0; }
        if(evt.key === 'd') { dx = 0; }
    };

    function retrieveClientId() {
        var key = "*----------------------------------------------------------*";
        var savedId = localStorage.getItem(key);
        if(savedId) {
            return savedId;
        } else {
            var newId = "clientId=client" + (parseInt(Math.random() * 1000));
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
            //BG
            cCtx.fillStyle='#000000';
            cCtx.fillRect(0, 0, width, height);

            if(data && data.clients) {
                cCtx.fillStyle = '#00FFFF';
                var d = { r: 10 };
                data.clients.forEach(function(c) {
                    cCtx.fillText(c.clientId, c.clientX - d.r, c.clientY - (d.r + 5) );
                    cCtx.fillRect(c.clientX - d.r, c.clientY - d.r, d.r * 2, d.r * 2);
                });
            }
        };
    }

    function initWsConnection(renderFunc, reportPosition) {

        const wsUri = 'ws://' + location.hostname  + ':' + location.port + '/ws/connect';
        const socket = new WebSocket(wsUri);

        socket.onopen = function(evt) {
            console.log("onopen", evt);
        };

        socket.onclose = function(evt) {
            console.log("onclose", evt);
        };

        socket.onmessage = function(evt) {
            renderFunc(JSON.parse(evt.data));
        };

        socket.onerror = function(evt) {
            console.log("onerror", evt);
        };

        /*
         * Init render
         */
        setTimeout(renderFunc, 10);

        /*
         * reporting of position
         */
        setInterval(function() {

            state.x += dx;
            state.y += dy;

            socket.send(JSON.stringify({
                clientX : state.x,
                clientY : state.y
            }));

        }, 2);

    }

    document.cookie = retrieveClientId();

    initWsConnection(initCanvas());

})();
