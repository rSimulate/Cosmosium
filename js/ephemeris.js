// ======= RELATIVE SCALES : ==========

// more realistic view:
//var SUN_SIZE = EARTH_SIZE * 109;
// var PLANET_SIZE = 1.5; // more realistic view
//var ASTEROID_SIZE = 0.4;
//var MOON_SIZE = PLANET_SIZE/3.0;


// scales for adjustment
var REALNESS    = 0;
function scale(class_scale,real_scale,ideal_scale){
    return class_scale*(real_scale*REALNESS + ideal_scale*(1-REALNESS));
}

var PLANET_SIZE   = scale(.1   ,1    ,250  ); // = earth size in view scene length units
var EARTH_SIZE    = PLANET_SIZE;

// diameter adjustments by body class:
var ASTEROID_SIZE = scale(EARTH_SIZE ,.001 ,.5   );
var MOON_SIZE     = scale(EARTH_SIZE ,1    , 1   );
var SUN_SIZE      = scale(EARTH_SIZE ,109  ,2    );

// diameter adjustments by specific bodies:
var MERCURY_SIZE  = scale(EARTH_SIZE ,.383  ,.5   );

var VENUS_SIZE    = scale(EARTH_SIZE ,.95   ,.95  );

var LUNA_SIZE     = scale(EARTH_SIZE ,0.28  ,.28  );

var MARS_SIZE     = scale(EARTH_SIZE ,.53   ,.53  );
var PHOBOS_SIZE   = scale(MOON_SIZE  ,.15   ,.15  );
var DEIMOS_SIZE   = scale(MOON_SIZE  ,.12   ,.12  );

var JUPITER_SIZE  = scale(EARTH_SIZE ,11    ,2    );
var CALLISTO_SIZE = scale(EARTH_SIZE ,.3785,.383  );
var GANYMEDE_SIZE = scale(EARTH_SIZE ,.4132,.4132 );
var EUROPA_SIZE   = scale(EARTH_SIZE ,.2451,.2451 );
var IO_SIZE       = scale(EARTH_SIZE ,.2861,.2861 );


// exageration of moonar orbit distances
var ORBIT_DIST    = scale(EARTH_SIZE ,1     ,.1    );
// specific moon distance adjustments:
var EARTH_MOON_EXAGGERATION   = scale(ORBIT_DIST,1,EARTH_SIZE  *1);
var MARS_MOON_EXAGGERATION    = scale(ORBIT_DIST,1,MARS_SIZE   *15);
var JUPITER_MOON_EXAGGERATION = scale(ORBIT_DIST,1,JUPITER_SIZE*1);

// ====================================


window.Ephemeris = {
  asteroid_2012_da14: {
    full_name: '2012 DA14',
    ma: 299.99868,
    epoch: 2456200.5,
    n: 0.98289640,
    a: 1.0018381,
    e: 0.1081389,
    i: 10.33722,

    w_bar: 58.33968,
    w: 271.07725,   // ARGUMENT of perihelion.  argument = longitude of perihelion - longitude of ascending node
    om: 147.26243,

    P: 365.256
  },

  // http://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html
  // http://ssd.jpl.nasa.gov/txt/aprx_pos_planets.pdf
  mercury: {
    full_name: 'Mercury',
    ma: 174.79252722,
    epoch: 2451545.0,
    a: 0.38709927,
    e: 0.20563593,
    i: 7.00497902,
    w_bar: 77.45779628,
    w: 29.12703035,
    L: 252.25032350,
    om: 48.33076593,
    P: 87.969
  },
  venus: {
    full_name: 'Venus',
    ma: 50.37663232,
    epoch: 2451545.0,
    a: 0.72333566,
    e: 0.00677672,
    i: 3.39467605,
    w_bar: 131.60246718,
    w: 54.92262463,
    L: 181.97909950,
    om: 76.67984255,
    P: 224.701
  },
  earth: {
    full_name: 'Earth',
    ma: -2.47311027,
    epoch: 2451545.0,
    a:1.00000261,
    e: 0.01671123,
    i: 0.00001531,
    w_bar: 102.93768193,
    w: 102.93768193,
    L: 100.46457166,
    //om:-11.26064,
    om: 0,
    P: 365.256
  },
  mars:{
    full_name: 'Mars',
    ma: 19.39019754,
    epoch: 2451545.0,
    a: 1.52371034,
    e: 0.09339410,
    i: 1.84969142,
    w_bar: -23.94362959,   // longitude of perihelion
    w: -73.5031685,   // argument of perihelion
    L: -4.55343205,    // mean longitude
    om: 49.55953891,    // longitude of ascending node
    P: 686.980
  },
  jupiter: {
    full_name: 'Jupiter',
    ma: 19.66796068,
    epoch: 2451545.0,
    a: 5.20288700,
    e: 0.04838624,
    i: 1.30439695,
    w_bar: 14.72847983,
    w: -85.74542926,
    L: 34.39644051,
    om: 100.47390909,
    P: 4332.589
  },
  luna: {
    full_name: 'Moon',
    ma: 135.27,
    epoch: 2451545.0,
    a: 0.00256955529 * EARTH_MOON_EXAGGERATION,  // exaggerating distance for visibility
    e: 0.0554,
    i: 5.16,
    w_bar: 83.23,
    w: 318.15,
    L: 13.176358,
    om: 125.08,
    P: 27.322
  },
  phobos: {
    full_name: 'Phobos',
    ma: 91.059,
    epoch: 2451545.0,
    a: 6.26746889e-5 * MARS_MOON_EXAGGERATION,  // exaggerating distance for visibility
    e: 0.0151,
    i: 1.075,
    w_bar: 357.841,
    w: 150.057,
    L: 1128.8447569,
    om: 207.784,
    P: 0.3189
  },
  deimos: {
    full_name: 'Deimos',
    ma: 325.329,
    epoch: 2451545.0,
    a: 0.000156807045 * MARS_MOON_EXAGGERATION,  // exaggerating distance for visibility
    e: 0.0002,
    i: 1.788,
    w_bar: 285.254,
    w: 260.729,
    L: 285.1618790,
    om: 24.525,
    P: 1.2624
  },
  ganymede: {
    full_name: 'Ganymede',
    ma: 317.540,
    epoch: 2451545.0,
    a: 0.00715518206 * JUPITER_MOON_EXAGGERATION,  // exaggerating distance for visibility
    e: 0.0013,
    i: 0.177,
    w_bar: 255.969,
    w: 192.417,
    L: 50.3176072,
    om: 63.552,
    P: 7.155
  },
  io: {
    full_name: 'Io',
    ma: 342.021,
    epoch: 2451545.0,
    a: 0.00281955885 * JUPITER_MOON_EXAGGERATION,  // exaggerating distance for visibility
    e: 0.0041,
    i: 0.036,
    w_bar: 128.106,
    w: 84.129,
    L: 203.4889583,
    om: 43.977,
    P: 1.769
  },
  europa: {
    full_name: 'Europa',
    ma: 171.016,
    epoch: 2451545.0,
    a: 0.00448602642 * JUPITER_MOON_EXAGGERATION,  // exaggerating distance for visibility
    e: 0.0094,
    i: 0.466,
    w_bar: 308.076,
    w: 88.970,
    L: 101.3747242,
    om: 219.106,
    P: 3.551
  },
  callisto: {
    full_name: 'Callisto',
    ma: 181.408,
    epoch: 2451545.0,
    a: 0.0125850722 * JUPITER_MOON_EXAGGERATION,  // exaggerating distance for visibility
    e: 0.0074,
    i: 0.192,
    w_bar: 351.491,
    w: 52.643,
    L: 21.5710728,
    om: 298.848,
    P: 16.69
  },

};

for (var x in Ephemeris) {
  if (Ephemeris.hasOwnProperty(x) && Ephemeris[x].w_bar && Ephemeris[x].L) {
    Ephemeris[x].ma = Ephemeris[x].L - Ephemeris[x].w_bar;
  }
}