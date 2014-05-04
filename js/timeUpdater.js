
function uTime(){
    el = document.getElementById('gametime')
    timeStrs = el.innerHTML.split(' ')
    month = timeStrs[0]
    yr    = timeStrs[1]
    newYr = parseInt(yr)+1
    el.innerHTML = month+' '+newYr;
}