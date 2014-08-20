if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

function RSimulate(opts) {
    var _this = this;
    this.cosmosUI = new CosmosUI();
    this.cosmosScene = new CosmosScene(this.cosmosUI);
    this.cosmosRender = new CosmosRender(this.cosmosScene, this.cosmosUI);

    function init() {
        _this.cosmosRender.init();
        console.log(_this.cosmosRender.getClock());
        _this.cosmosScene.init(_this.cosmosRender.CAMERA_FAR, _this.cosmosRender.getClock());
        _this.cosmosUI.init(_this.cosmosRender, _this.cosmosScene);

        window.addEventListener( 'resize', onWindowResize, false );

        _this.cosmosRender.orbitCamera(this.CosmosScene.sun);
    }

    init();
    this.cosmosRender.animate();
}

// TODO: Do we need this listener anymore?

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
    ws.send(message('refresh','None'));
}