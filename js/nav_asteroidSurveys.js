document.getElementById('systemView-NEOs-link').addEventListener('click', function (e){
    e = e || window.event; 
    $('#content').load('/content?name=systemView');
    THREE.OrbitControls.enabled = true;
    $('#systemBG').load('/asteroidSearch?group=NEOs');
}, false);

document.getElementById('systemView-MainBelt-link').addEventListener('click', function (e){
    e = e || window.event; 
    $('#content').load('/content?name=systemView');
    THREE.OrbitControls.enabled = true;
    $('#systemBG').load('/asteroidSearch?group=mainBelt');
}, false);
