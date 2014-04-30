// defines a function for generating a client websocket message

function message(command,data){
    // returns a message string defining a message dictionary
    var uID = 'testUser';
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