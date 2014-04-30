function prependContent(m){
    document.getElementById('content').innerHTML = m + document.getElementById('content').innerHTML;
}

function parseMessage(m){
    // interprets and carries out messages
    
    var cmd = m.split('"')[3];
    var data = m.split(',"data":"')[1].slice(0,-2);
    
    if (cmd == "addToContent"){
        prependContent(data)
    } else {
        console.log("ERR: unknown message to client: "+m);
    }
}