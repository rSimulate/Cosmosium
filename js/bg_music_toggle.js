var audio = document.getElementById('background_audio');

document.getElementById('musicMute').addEventListener('click', function (e)
{
    e = e || window.event;
    audio.muted = !audio.muted;
    
    if (audio.muted){
        document.getElementById('musicAttribution').style.color = "rgb(200,200,200)"
    } else {
        document.getElementById('musicAttribution').style.color = "rgb(100,100,100)"
    }
    e.preventDefault();
}, false);