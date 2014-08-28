// ======= RELATIVE SCALES : ==========

// more realistic view:
//var SUN_SIZE = EARTH_SIZE * 109;
// var PLANET_SIZE = 1.5; // more realistic view
//var ASTEROID_SIZE = 0.4;
//var MOON_SIZE = PLANET_SIZE/3.0;


// scales for adjustment
var REALNESS = 0;
function scale(class_scale, real_scale, ideal_scale) {
    return class_scale * (real_scale * REALNESS + ideal_scale * (1 - REALNESS));
}

var PLANET_SIZE = scale(.1, 1, 50); // = earth size in view scene length units
var EARTH_SIZE = PLANET_SIZE;
var LUNA_SIZE = scale(EARTH_SIZE, 0.28, .28);

// diameter adjustments by body class:
var ASTEROID_SIZE = scale(EARTH_SIZE, .001, .5);
var MOON_SIZE = scale(EARTH_SIZE, 1, 1);
var SUN_SIZE = scale(EARTH_SIZE, 109, 10);

// diameter adjustments by specific bodies:
var MERCURY_SIZE = scale(EARTH_SIZE, .383, .5);
var VENUS_SIZE = scale(EARTH_SIZE, .95, .95);
var MARS_SIZE = scale(EARTH_SIZE, .53, .53);

var JUPITER_SIZE = scale(EARTH_SIZE, 11, 5);
var PHOBOS_SIZE = scale(MOON_SIZE, .15, .05);
var DEIMOS_SIZE = scale(MOON_SIZE, .12, .03);
var CALLISTO_SIZE = scale(MOON_SIZE, .3785, .383);
var GANYMEDE_SIZE = scale(MOON_SIZE, .4132, .4132);
var EUROPA_SIZE = scale(MOON_SIZE, .2451, .2451);
var IO_SIZE = scale(MOON_SIZE, .2861, .2861);

var SATURN_SIZE = scale(EARTH_SIZE, 9.14, 3.5);
var TITAN_SIZE = scale(MOON_SIZE, .4043, .4043);
var RHEA_SIZE = scale(MOON_SIZE, .1197, .1197);
var IAPETUS_SIZE = scale(MOON_SIZE, .1152, .1152);
var DIONE_SIZE = scale(MOON_SIZE, .088, .088);
var TETHYS_SIZE = scale(MOON_SIZE, .0833, .0833);

var URANUS_SIZE = scale(EARTH_SIZE, 4, 1);
var MIRANDA_SIZE = scale(MOON_SIZE, 0.1195, 0.1195);
var ARIEL_SIZE = scale(MOON_SIZE, 0.0908, 0.0908);
var UMBRIEL_SIZE = scale(MOON_SIZE, 0.0917, 0.0917);
var TITANIA_SIZE = scale(MOON_SIZE, 0.1237, 0.1237);
var OBERON_SIZE = scale(MOON_SIZE, 0.1195, 0.1195);

var NEPTUNE_SIZE = scale(EARTH_SIZE, 3.8, 1);
var PROTEUS_SIZE = scale(MOON_SIZE, 0.0311, 0.0311);
var TRITON_SIZE = scale(MOON_SIZE, 0.2010, 0.2010);
var NEREID_SIZE = scale(MOON_SIZE, 0.0311, 0.0311);