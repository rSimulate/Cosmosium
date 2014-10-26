// ======= RELATIVE SCALES : ==========

// more realistic view:
//var SUN_SIZE = EARTH_SIZE * 109;
// var PLANET_SIZE = 1.5; // more realistic view
//var ASTEROID_SIZE = 0.4;
//var MOON_SIZE = PLANET_SIZE/3.0;


// scales for adjustment
var REALNESS = 0;
function scale(class_scale, real_scale, ideal_scale) {
    return class_scale * (real_scale * REALNESS + ideal_scale * (1.05 - REALNESS));
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


// exageration of moonar orbit distances
var ORBIT_DIST    = scale(EARTH_SIZE ,1     ,.1    );
// specific moon distance adjustments:
var EARTH_MOON_EXAGGERATION   = scale(ORBIT_DIST,1,EARTH_SIZE);
var MARS_MOON_EXAGGERATION    = scale(ORBIT_DIST,1,MARS_SIZE * 15);
var JUPITER_MOON_EXAGGERATION = scale(ORBIT_DIST,1,JUPITER_SIZE);
var SATURN_MOON_EXAGGERATION = scale(ORBIT_DIST, 1, SATURN_SIZE * 0.5);
var URANUS_MOON_EXAGGERATION = scale(ORBIT_DIST, 1, URANUS_SIZE * 3);
var NEPTUNE_MOON_EXAGGERATION = scale(ORBIT_DIST, 1, NEPTUNE_SIZE * 6);

// ====================================

window.Ephemeris = {
    // http://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html
    // http://ssd.jpl.nasa.gov/txt/aprx_pos_planets.pdf
    mercury: {
        orbit: {full_name: 'Mercury',
            ma: 174.79252722,
            epoch: 2451545.0,
            a: 0.38709927,
            e: 0.20563593,
            i: 7.00497902,
            w_bar: 77.45779628,
            w: 29.12703035,
            L: 252.25032350,
            om: 48.33076593,
            P: 87.969},
        type: 'planet'
    },
    venus: {
        orbit: {full_name: 'Venus',
            ma: 50.37663232,
            epoch: 2451545.0,
            a: 0.72333566,
            e: 0.00677672,
            i: 3.39467605,
            w_bar: 131.60246718,
            w: 54.92262463,
            L: 181.97909950,
            om: 76.67984255,
            P: 224.701},
        type: 'planet'
    },
    earth: {
        orbit: {full_name: 'Earth',
            ma: -2.47311027,
            epoch: 2451545.0,
            a: 1.00000261,
            e: 0.01671123,
            i: 0.00001531,
            w_bar: 102.93768193,
            w: 102.93768193,
            L: 100.46457166,
            //om:-11.26064,
            om: 0,
            P: 365.256},
        type: 'planet'
    },
    mars: {
        orbit: {full_name: 'Mars',
            ma: 19.39019754,
            epoch: 2451545.0,
            a: 1.52371034,
            e: 0.09339410,
            i: 1.84969142,
            w_bar: -23.94362959,   // longitude of perihelion
            w: -73.5031685,   // argument of perihelion
            L: -4.55343205,    // mean longitude
            om: 49.55953891,    // longitude of ascending node
            P: 686.980},
        type: 'planet'
    },
    jupiter: {
        orbit: {full_name: 'Jupiter',
            ma: 19.66796068,
            epoch: 2451545.0,
            a: 5.20288700,
            e: 0.04838624,
            i: 1.30439695,
            w_bar: 14.72847983,
            w: -85.74542926,
            L: 34.39644051,
            om: 100.47390909,
            P: 4332.589},
        type: 'planet'
    },
    saturn: {
        orbit: {full_name: 'Saturn',
            a: 9.53667594,
            e: 0.05386179,
            i: 2.48599187,
            w: -23.98613,
            L: 49.95424423,
            om: 113.66242448,
            P: 10759.22},
        type: 'planet'
    },
    uranus: {
        orbit: {full_name: 'Uranus',
            a: 19.18916464,
            e: 0.04725744,
            i: 0.77263783,
            w: 96.998857,
            L: 313.23810451,
            om: 74.01692503,
            P: 30687.15},
        type: 'planet'
    },
    neptune: {
        orbit: {full_name: 'Neptune',
            a: 30.06992276,
            e: 0.00859048,
            i: 1.77004347,
            w: 273.219414,
            L: -55.12002969,
            om: 131.78422574,
            P: 60190.03},
        type: 'planet'
    },
    luna: {
        orbit: {full_name: 'Moon',
            ma: 135.27,
            epoch: 2451545.0,
            a: 0.00256955529 * EARTH_MOON_EXAGGERATION,  // exaggerating distance for visibility
            e: 0.0554,
            i: 5.16,
            w_bar: 83.23,
            w: 318.15,
            L: 13.176358,
            om: 125.08,
            P: 27.322},
        type: 'moon'
    },
    phobos: {
        orbit: {full_name: 'Phobos',
            ma: 91.059,
            epoch: 2451545.0,
            a: 6.26746889e-5 * MARS_MOON_EXAGGERATION,  // exaggerating distance for visibility
            e: 0.0151,
            i: 1.075,
            w_bar: 357.841,
            w: 150.057,
            L: 1128.8447569,
            om: 207.784,
            P: 0.3189},
        type: 'moon'
    },
    deimos: {
        orbit: {full_name: 'Deimos',
            ma: 325.329,
            epoch: 2451545.0,
            a: 0.000156807045 * MARS_MOON_EXAGGERATION,  // exaggerating distance for visibility
            e: 0.0002,
            i: 1.788,
            w_bar: 285.254,
            w: 260.729,
            L: 285.1618790,
            om: 24.525,
            P: 1.2624},
        type: 'moon'
    },
    ganymede: {
        orbit: {full_name: 'Ganymede',
            ma: 317.540,
            epoch: 2451545.0,
            a: 0.00715518206 * JUPITER_MOON_EXAGGERATION,  // exaggerating distance for visibility
            e: 0.0013,
            i: 0.177,
            w_bar: 255.969,
            w: 192.417,
            L: 50.3176072,
            om: 63.552,
            P: 7.155},
        type: 'moon'
    },
    io: {
        orbit: {full_name: 'Io',
            ma: 342.021,
            epoch: 2451545.0,
            a: 0.00281955885 * JUPITER_MOON_EXAGGERATION,  // exaggerating distance for visibility
            e: 0.0041,
            i: 0.036,
            w_bar: 128.106,
            w: 84.129,
            L: 203.4889583,
            om: 43.977,
            P: 1.769},
        type: 'moon'
    },
    europa: {
        orbit: {full_name: 'Europa',
            ma: 171.016,
            epoch: 2451545.0,
            a: 0.00448602642 * JUPITER_MOON_EXAGGERATION,  // exaggerating distance for visibility
            e: 0.0094,
            i: 0.466,
            w_bar: 308.076,
            w: 88.970,
            L: 101.3747242,
            om: 219.106,
            P: 3.551},
        type: 'moon'
    },
    callisto: {
        orbit: {full_name: 'Callisto',
            ma: 181.408,
            epoch: 2451545.0,
            a: 0.0125850722 * JUPITER_MOON_EXAGGERATION,  // exaggerating distance for visibility
            e: 0.0074,
            i: 0.192,
            w_bar: 351.491,
            w: 52.643,
            L: 21.5710728,
            om: 298.848,
            P: 16.69},
        type: 'moon'
    },

    titan: {
        orbit: {full_name: 'Titan',
            a: 0.00816769647 * SATURN_MOON_EXAGGERATION,
            e: 0.0288,
            i: 0.312,
            w: 185.671,
            L: 225.327,
            om: 24.502,
            P: 15.95},
        type: 'moon'
    },
    rhea: {
        orbit: {full_name: 'Rhea',
            a: 0.00352349935 * SATURN_MOON_EXAGGERATION,
            e: 0.001,
            i: 0.331,
            w: 256.609,
            L: 879.691,
            om: 311.531,
            P: 4.518212},
        type: 'moon'
    },
    iapetus: {
        orbit: {full_name: 'Iapetus',
            a: 0.0238026115 * SATURN_MOON_EXAGGERATION,
            e: 0.0283,
            i: 7.489,
            w: 275.921,
            L: 707.781,
            om: 75.831,
            P: 79.3215},
        type: 'moon'
    },
    dione: {
        orbit: {full_name: 'Dione',
            a: 0.00252273644 * SATURN_MOON_EXAGGERATION,
            e: 0.0022,
            i: 0.028,
            w: 168.820,
            L: 403.719,
            om: 168.909,
            P: 2.736915},
        type: 'moon'
    },
    tethys: {
        orbit: {full_name: 'Tethys',
            a: 0.00196940637 * SATURN_MOON_EXAGGERATION,
            e: 0.0001,
            i: 1.091,
            w: 262.845,
            L: 782.73,
            om: 330.882,
            P: 1.887802},
        type: 'moon'
    },
    miranda: {
        orbit: {full_name: 'Miranda',
            a: 0.000868327867 * URANUS_MOON_EXAGGERATION,
            e: 0.0013,
            i: 4.338,
            w: 68.312,
            L: 706.08,
            om: 326.438,
            P: 1.413479},
        type: 'moon'
    },
    ariel: {
        orbit: {full_name: 'Ariel',
            a: 0.00127608768 * URANUS_MOON_EXAGGERATION,
            e: 0.0012,
            i: 0.041,
            w: 115.349,
            L: 177.224,
            om: 22.394,
            P: 2.520},
        type: 'moon'
    },
    umbriel: {
        orbit: {full_name: 'Umbriel',
            a: 0.00177810017 * URANUS_MOON_EXAGGERATION,
            e: 0.0039,
            i: 0.128,
            w: 84.709,
            L: 130.663,
            om: 33.485,
            P: 4.144},
        type: 'moon'
    },
    titania: {
        orbit: {full_name: 'Titania',
            a: 0.00291648536 * URANUS_MOON_EXAGGERATION,
            e: 0.0011,
            i: 1.079,
            w: 284.400,
            L: 404.785,
            om: 99.771,
            P: 8.706234},
        type: 'moon'
    },
    oberon: {
        orbit: {full_name: 'Oberon',
            a: 0.00390045659 * URANUS_MOON_EXAGGERATION,
            e: 0.0014,
            i: 0.068,
            w: 104.400,
            L: 667.259,
            om: 279.771,
            P: 13.463234},
        type: 'moon'
    },
    proteus: {
        orbit: {full_name: 'Proteus',
            a: 0.000786421621 * NEPTUNE_MOON_EXAGGERATION,
            e: 0.0005,
            i: 0.026,
            w: 301.706,
            L: 581.446,
            om: 162.690,
            P: 1.12231477},
        type: 'moon'
    },
    triton: {
        orbit: {full_name: 'Triton',
            a: 0.00237169151 * NEPTUNE_MOON_EXAGGERATION,
            e: 0.0,
            i: 156.834,
            w: 344.046,
            L: 781.311,
            om: 172.431,
            P: -5.876854},
        type: 'moon'
    },
    nereid: {
        orbit: {full_name: 'Nereid',
            a: 0.0368548026 * NEPTUNE_MOON_EXAGGERATION,
            e: 0.7512,
            i: 7.232,
            w: 280.830,
            L: 974.933,
            om: 334.762,
            P: 360.1362},
        type: 'moon'
    }
};

for (var x in window.Ephemeris) {
    var body = window.Ephemeris[x];
    if (body.hasOwnProperty('orbit')) {
        body.orbit.epoch = 2451545.0;
        if (body.orbit.w && body.orbit.om) {
            body.orbit.w_bar = body.orbit.w + body.orbit.om;
        }
        if (body.orbit.w_bar && body.orbit.L) {
            body.orbit.ma = body.orbit.L - body.orbit.w_bar;
        }
        if (body.orbit.P && body.orbit.P > 0) {
            body.orbit.P += 6;
        }
        else {
            body.orbit.P -= 6;
        }
    }
}