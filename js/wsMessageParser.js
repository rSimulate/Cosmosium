function prependContent(newContent){
    // adds new content HTML to the beginning of the content section
    document.getElementById('content').innerHTML = newContent + document.getElementById('content').innerHTML;
}

function updateResources(newHTML){
    // replaces resource bar HTML with fresh, updated code. 
    document.getElementById("resource-bar").innerHTML = newHTML;
}

function parseMessage(m){
    // interprets and carries out messages
    
    var cmd = m.split('"')[3];  // this should be right so long as "cmd" is listed first...
    var data = m.split(',"data":"')[1].slice(0,-2); // this assumes "data" is listed last
    
    if (cmd == "addToContent"){
        prependContent(data)
    } else if (cmd = "updateResources"){
        updateResources(data)
    } else if (cdm = "researchCompleted"){
        // try sending update to techtree (only works if techtree is displayed)
        techtree.completeResearch(data);
        // TODO: add user notification?
    } else {
        console.log("ERR: unknown message to client: "+m);
    }
}