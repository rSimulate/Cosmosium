
function uTime(){
    var el = document.getElementById('gametime');
    var timeStrs = el.innerHTML.split(' ');
    var month = timeStrs[0];
    var yr    = timeStrs[1];
    var newYr = parseInt(yr)+1;
    el.innerHTML = month+' '+newYr;
}