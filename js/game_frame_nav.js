/*
 Ajax navigation controls for the sidebar.
*/
var openContent = $('#dash');

// jVectorMap for Launch Sites
var launchMap = new jvm.WorldMap({
    map: 'world_mill_en',
    container: $('#world-map'),
    backgroundColor: "#fff",
    regionStyle: {
        initial: {
            fill: '#e4e4e4',
            "fill-opacity": 1,
            stroke: 'none',
            "stroke-width": 0,
            "stroke-opacity": 1
        },
        hover: {
            fill: '#3b8bba'
        }
    },
    markers: [
        {latLng: [45.80, 63.20], name: 'Baikanur Cosmodrome'},
        {latLng: [27.30, -80.90], name: 'Cape Canaveral'},
        {latLng: [31.10, 130.97], name: 'Tanegashama Space Center'},
        {latLng: [36.59, -111.40], name: 'SpaceXs Spaceport America'}
    ]
});

// jVectorMap for Observatories
var observatoryMap = new jvm.WorldMap({
    map: 'world_mill_en',
    container: $('#observatory-world-map'),
    backgroundColor: "#fff",
    regionStyle: {
        initial: {
            fill: '#e4e4e4',
            "fill-opacity": 1,
            stroke: 'none',
            "stroke-width": 0,
            "stroke-opacity": 1
        },
        hover: {
            fill: '#3b8bba'
        }
    },
    markers: [
        {latLng: [45.80, 63.20], name: 'Baikanur Cosmodrome'},
        {latLng: [27.30, -80.90], name: 'Cape Canaveral'},
        {latLng: [31.10, 130.97], name: 'Tanegashama Space Center'},
        {latLng: [36.59, -111.40], name: 'SpaceXs Spaceport America'}
    ]
});


function switchContent(content) {
    openContent.hide();
    rSimulate.cosmosRender.enableControls();
    if (content != undefined) {
        openContent = content;
        rSimulate.cosmosRender.disableControls();
        openContent.show();
    }
}
