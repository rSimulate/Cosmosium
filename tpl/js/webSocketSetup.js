

var ws = new WebSocket("ws://{{DOMAIN}}/websocket");
    ws.onopen = function() {
        ws.send("hello {{client_id}}");
};
ws.onmessage = function (evt) {
    parseMessage(evt.data);
};
ws.onclose = function (){
    ws.send("goodbye {{client_id}}");
};