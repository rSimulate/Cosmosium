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

var PLANET_SIZE = scale(.1, 1, 250); // = earth size in view scene length units
var EARTH_SIZE = PLANET_SIZE;

// diameter adjustments by body class:
var ASTEROID_SIZE = scale(EARTH_SIZE, .001, .5);
var MOON_SIZE = scale(EARTH_SIZE, 1, 1);
var SUN_SIZE = scale(EARTH_SIZE, 109, 2);

// diameter adjustments by specific bodies:
var MERCURY_SIZE = scale(EARTH_SIZE, .383, .5);

var VENUS_SIZE = scale(EARTH_SIZE, .95, .95);

var LUNA_SIZE = scale(EARTH_SIZE, 0.28, .28);

var MARS_SIZE = scale(EARTH_SIZE, .53, .53);
var PHOBOS_SIZE = scale(MOON_SIZE, .15, .15);
var DEIMOS_SIZE = scale(MOON_SIZE, .12, .12);

var JUPITER_SIZE = scale(EARTH_SIZE, 11, 2);
var SATURN_SIZE = scale(EARTH_SIZE, 9.14, 2);
var CALLISTO_SIZE = scale(EARTH_SIZE, .3785, .383);
var GANYMEDE_SIZE = scale(EARTH_SIZE, .4132, .4132);
var EUROPA_SIZE = scale(EARTH_SIZE, .2451, .2451);
var IO_SIZE = scale(EARTH_SIZE, .2861, .2861);
// ====================================
