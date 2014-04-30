// defines a function for generating a client websocket message

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function message(command,data){
    // returns a message string defining a message dictionary
    var uID = readCookie('cosmosium_login');
    var gID = 'testGame';
    var datStr='{'
    datStr+='"uID":"'+uID+'"'
    datStr+=','
    datStr+='"gID":"'+gID+'"'
    datStr+=','
    datStr+='"cmd":"'+command+'"'
    datStr+=','
    datStr+='"dat":"'+data+'"'
    datStr+='}'
    return datStr;
}