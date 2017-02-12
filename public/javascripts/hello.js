(function() {

    var render;

    document.cookie = retrieveClientId();

    render = initCanvas();
    initWsConnection();

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

        if(cElm.getContext) {
            var cCtx = cElm.getContext("2d");
            return function render(data) {
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
            }
        } else {
            return function() {
                throw new Error('Unable to setup render function.');
            }
        }
    }

    function initWsConnection() {
        // BEGIN SOCKET
        var wsUri = 'ws://' + location.hostname  + ':' + location.port + '/ws/connect';
        var socket = new WebSocket(wsUri);
        socket.onopen = function(evt) {
            console.log("onopen", evt);
        };
        socket.onclose = function(evt) {
            console.log("onclose", evt);
        };
        socket.onmessage = function(evt) {
            render(JSON.parse(evt.data));
        };
        socket.onerror = function(evt) {
            console.log("onerror", evt);
        };
        // END SOCKET

        //BEGIN EVENT_HANDLING
        window.onmousemove =  function(evt) {
            socket.send(JSON.stringify({
                clientX : evt.clientX,
                clientY : evt.clientY
            }));
        };

        //END EVENT HANDLING
    }


    /**
     * Init render
     */
    setTimeout(render, 10);

})();
