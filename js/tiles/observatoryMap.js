//World map by jvectormap
$('#world-map').vectorMap({
    map: 'world_mill_en',
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
  {latLng: [36.59, -111.40], name: 'SpaceXs Spaceport America'}]
    
});