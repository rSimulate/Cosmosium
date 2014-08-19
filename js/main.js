if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

function RSimulate(opts) {

    function init() {
        CosmosScene.init();
        CosmosRender.init();
        CosmosUI.init();

        window.addEventListener( 'resize', onWindowResize, false );

        CosmosScene.orbitCamera(CosmosScene.sun);
    }
    function animate() {
        CosmosRender.render();
    }

    function onWindowResize() {
        camera.aspect = $(canvas).width() / $(canvas).height();
        farCamera.aspect = $(canvas).width() / $(canvas).height();
        camera.updateProjectionMatrix();
        farCamera.updateProjectionMatrix();

        renderer.setSize($(canvas).width(), $(canvas).height());

        render();
    }

    init();
    animate();
}


// the following is needed to have relative URLs to different ports
// delegate event for performance, and save attaching a million events to each anchor
document.addEventListener('click', function(event) {
  var target = event.target;
  if (target.tagName.toLowerCase() == 'a')
  {
      var port = target.getAttribute('href').match(/^:(\d+)(.*)/);
      if (port)
      {
         target.href = port[2];
         target.port = port[1];
      }
  }
}, false);

var rSimulate;

$(document).ready(function(){
    $("#body-info-container").hide();
    $("#dash").show();

    console.log("Refreshing webGL canvas")
});

// called once the webSocket makes a complete connection in webSocketSetup.js.tpl
function initrSimulate() {
    // refresh webGL
    rSimulate = new RSimulate({});
    jCanvas = $('#canvas');

    // Configure webGL canvas to conform to parent div
    $(renderer.domElement).css('height', '');
    renderer.setSize(jCanvas.width(), jCanvas.height());
    camera.aspect = $(canvas).width() / $(canvas).height();
    farCamera.aspect = $(canvas).width() / $(canvas).height();
    camera.updateProjectionMatrix();
    farCamera.updateProjectionMatrix();

    ws.send(message('refresh','None'));
}