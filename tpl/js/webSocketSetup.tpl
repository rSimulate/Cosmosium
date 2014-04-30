
var ws = new WebSocket("ws://{{DOMAIN}}/websocket");

ws.onopen = function() {
    ws.send(message("hello"));
    console.log('websocket connection opened');
};

ws.onmessage = function (evt) {
    parseMessage(evt.data);
};

ws.onclose = function (){
    ws.send(message("goodbye"));
};