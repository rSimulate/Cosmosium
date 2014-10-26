if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

function RSimulate(opts) {
    var _this = this;
    this.cosmosUI = new CosmosUI();
    this.cosmosScene = new CosmosScene(this.cosmosUI);
    this.cosmosRender = new CosmosRender(this.cosmosScene, this.cosmosUI);

    function init() {
        _this.cosmosRender.init();
        _this.cosmosScene.init(_this.cosmosRender);
        _this.cosmosUI.init(_this.cosmosScene, _this.cosmosRender);

        window.addEventListener( 'resize', _this.cosmosRender.onWindowResize, false );

        _this.cosmosRender.orbitCamera(_this.cosmosScene.getSolarCentricObject());
    }
    init();
    this.cosmosRender.animate();
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
    console.log("initiating solarSystem view")
    initrSimulate();
});

// called once the webSocket makes a complete connection in webSocketSetup.js.tpl
function initrSimulate() {
    // refresh webGL
    rSimulate = new RSimulate({});
}

