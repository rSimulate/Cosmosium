from uuid import uuid4

REALNESS = 0


def scale(class_scale, real_scale, ideal_scale):
    return class_scale * (real_scale * REALNESS + ideal_scale * (1 - REALNESS))

PLANET_SIZE = scale(.1, 1, 250)  # = earth size in view scene length units
EARTH_SIZE = PLANET_SIZE
MARS_SIZE = scale(EARTH_SIZE, .53, .53)
JUPITER_SIZE = scale(EARTH_SIZE, 11, 2)
SATURN_SIZE = scale(EARTH_SIZE, 9.14, 2)
URANUS_SIZE = scale(EARTH_SIZE, 4, 1)
NEPTUNE_SIZE = scale(EARTH_SIZE, 3.8, 1)
CALLISTO_SIZE = scale(EARTH_SIZE, .3785, .383)
GANYMEDE_SIZE = scale(EARTH_SIZE, .4132, .4132)
EUROPA_SIZE = scale(EARTH_SIZE, .2451, .2451)

# exaggeration of moon orbit distances
ORBIT_DIST = scale(EARTH_SIZE, 1, .1)
# specific moon distance adjustments:
EARTH_MOON_EXAGGERATION = scale(ORBIT_DIST, 1, EARTH_SIZE)
MARS_MOON_EXAGGERATION = scale(ORBIT_DIST, 1, MARS_SIZE * 15)
JUPITER_MOON_EXAGGERATION = scale(ORBIT_DIST, 1, JUPITER_SIZE)
SATURN_MOON_EXAGGERATION = scale(ORBIT_DIST, 1, SATURN_SIZE)
URANUS_MOON_EXAGGERATION = scale(ORBIT_DIST, 1, URANUS_SIZE * 3)
NEPTUNE_MOON_EXAGGERATION = scale(ORBIT_DIST, 1, NEPTUNE_SIZE)


class BodyDB(object):
    def __init__(self):
        # http':#nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html
        # http':#ssd.jpl.nasa.gov/txt/aprx_pos_planets.pdf
        self.bodies = list()
        mercury = {
            'orbit': {'full_name': 'Mercury',
                      'a': 0.38709927,
                      'e': 0.20563593,
                      'i': 7.00497902,
                      'w': 29.12703035,
                      'L': 252.25032350,
                      'om': 48.33076593,
                      'P': 87.969},
            'objectId': str(uuid4()),
            'type': 'planet'}
        venus = {
            'orbit': {'full_name': 'Venus',
                    'a': 0.72333566,
                    'e': 0.00677672,
                    'i': 3.39467605,
                    'w': 54.92262463,
                    'L': 181.97909950,
                    'om': 76.67984255,
                    'P': 224.701},
            'objectId': str(uuid4()),
            'type': 'planet'}
        earth = {
            'orbit': {'full_name': 'Earth',
                    'a': 1.00000261,
                    'e': 0.01671123,
                    'i': 0.00001531,
                    'w': 102.93768193,
                    'L': 100.46457166,
                    # om':-11.26064,
                    'om': 0,
                    'P': 365.256},
            'objectId': str(uuid4()),
            'type': 'planet'}
        mars = {
            'orbit': {'full_name': 'Mars',
                    'a': 1.52371034,
                    'e': 0.09339410,
                    'i': 1.84969142,
                    'w': -73.5031685,  # argument of perihelion
                    'L': -4.55343205,  # mean longitude
                    'om': 49.55953891,  # longitude of ascending node
                    'P': 686.980},
            'objectId': str(uuid4()),
            'type': 'planet'}
        jupiter = {
            'orbit': {'full_name': 'Jupiter',
                    'a': 5.20288700,
                    'e': 0.04838624,
                    'i': 1.30439695,
                    'w': -85.74542926,
                    'L': 34.39644051,
                    'om': 100.47390909,
                    'P': 4332.589},
            'objectId': str(uuid4()),
            'type': 'planet'}
        saturn = {
            'orbit': {'full_name': 'Saturn',
                      'a': 9.53667594,
                      'e': 0.05386179,
                      'i': 2.48599187,
                      'w': -23.98613,
                      'L': 49.95424423,
                      'om': 113.66242448,
                      'P': 10759.22},
            'objectId': str(uuid4()),
            'type': 'planet'}
        uranus = {
            'orbit': {'full_name': 'Uranus',
                      'a': 19.18916464,
                      'e': 0.04725744,
                      'i': 0.77263783,
                      'w': 96.998857,
                      'L': 313.23810451,
                      'om': 74.01692503,
                      'P': 30687.15},
            'objectId': str(uuid4()),
            'type': 'planet'}
        neptune = {
            'orbit': {'full_name': 'Neptune',
                      'a': 30.06992276,
                      'e': 0.00859048,
                      'i': 1.77004347,
                      'w': 273.219414,
                      'L': -55.12002969,
                      'om': 131.78422574,
                      'P': 60190.03},
            'objectId': str(uuid4()),
            'type': 'planet'}
        luna = {
            'orbit': {'full_name': 'Moon',
                    'a': 0.00256955529 * EARTH_MOON_EXAGGERATION,  # exaggerating distance for visibility
                    'e': 0.0554,
                    'i': 5.16,
                    'w': 318.15,
                    'L': 13.176358,
                    'om': 125.08,
                    'P': 27.322},
            'objectId': str(uuid4()),
            'type': 'moon'}
        phobos = {
            'orbit': {'full_name': 'Phobos',
                    'a': 6.26746889e-5 * MARS_MOON_EXAGGERATION,  # exaggerating distance for visibility
                    'e': 0.0151,
                    'i': 1.075,
                    'w': 150.057,
                    'L': 1128.8447569,
                    'om': 207.784,
                    'P': 0.3189},
            'objectId': str(uuid4()),
            'type': 'moon'}
        deimos = {
            'orbit': {'full_name': 'Deimos',
                    'a': 0.000156807045 * MARS_MOON_EXAGGERATION,  # exaggerating distance for visibility
                    'e': 0.0002,
                    'i': 1.788,
                    'w': 260.729,
                    'L': 285.1618790,
                    'om': 24.525,
                    'P': 1.2624},
            'objectId': str(uuid4()),
            'type': 'moon'}
        ganymede = {
            'orbit': {'full_name': 'Ganymede',
                    'a': 0.00715518206 * JUPITER_MOON_EXAGGERATION,  # exaggerating distance for visibility
                    'e': 0.0013,
                    'i': 0.177,
                    'w': 192.417,
                    'L': 50.3176072,
                    'om': 63.552,
                    'P': 7.155},
            'objectId': str(uuid4()),
            'type': 'moon'}
        io = {
            'orbit': {'full_name': 'Io',
                    'a': 0.00281955885 * JUPITER_MOON_EXAGGERATION,  # exaggerating distance for visibility
                    'e': 0.0041,
                    'i': 0.036,
                    'w': 84.129,
                    'L': 203.4889583,
                    'om': 43.977,
                    'P': 1.769},
            'objectId': str(uuid4()),
            'type': 'moon'}
        europa = {
            'orbit': {'full_name': 'Europa',
                    'a': 0.00448602642 * JUPITER_MOON_EXAGGERATION,  # exaggerating distance for visibility
                    'e': 0.0094,
                    'i': 0.466,
                    'w': 88.970,
                    'L': 101.3747242,
                    'om': 219.106,
                    'P': 3.551},
            'objectId': str(uuid4()),
            'type': 'moon'}
        callisto = {
            'orbit': {'full_name': 'Callisto',
                      'a': 0.0125850722 * JUPITER_MOON_EXAGGERATION,  # exaggerating distance for visibility
                      'e': 0.0074,
                      'i': 0.192,
                      'w': 52.643,
                      'L': 21.5710728,
                      'om': 298.848,
                      'P': 16.69},
            'objectId': str(uuid4()),
            'type': 'moon'}

        # Keplerian Elements retrieved and calculated from ftp://ftp.mpe.mpg.de/pub/LB_chapter_4.2._final.pdf
        # Page 15
        # Orbital periods, P, retrieved from wikipedia.org
        titan = {
            'orbit': {'full_name': 'Titan',
                      'a': 0.00816769647 * SATURN_MOON_EXAGGERATION,  # a was converted from km -> au
                      'e': 0.0288,
                      'i': 0.312,
                      'w': 185.671,
                      'L': 225.327,  # L = M + om + w  http://en.wikipedia.org/wiki/Mean_longitude // M = 15.154
                      'om': 24.502,
                      'P': 15.95},
            'objectId': str(uuid4()),
            'type': 'moon'}
        rhea = {
            'orbit': {'full_name': 'Rhea',
                      'a': 0.00352349935 * SATURN_MOON_EXAGGERATION,
                      'e': 0.001,
                      'i': 0.331,
                      'w': 256.609,
                      'L': 879.691,  # Mean Anomaly = 311.551
                      'om': 311.531,
                      'P': 4.518212}, # TODO
            'objectId': str(uuid4()),
            'type': 'moon'}
        iapetus = {
            'orbit': {'full_name': 'Iapetus',
                      'a': 0.0238026115 * SATURN_MOON_EXAGGERATION,
                      'e': 0.0283,
                      'i': 7.489,
                      'w': 275.921,
                      'L': 707.781,  # M = 356.029
                      'om': 75.831,
                      'P': 79.3215},
            'objectId': str(uuid4()),
            'type': 'moon'}
        dione = {
            'orbit': {'full_name': 'Dione',
                      'a': 0.00252273644 * SATURN_MOON_EXAGGERATION,
                      'e': 0.0022,
                      'i': 0.028,
                      'w': 168.820,
                      'L': 403.719,  # M = 65.990
                      'om': 168.909,
                      'P': 2.736915},
            'objectId': str(uuid4()),
            'type': 'moon'}
        tethys = {
            'orbit': {'full_name': 'Tethys',
                      'a': 0.00196940637 * SATURN_MOON_EXAGGERATION,
                      'e': 0.0001,
                      'i': 1.091,
                      'w': 262.845,
                      'L': 782.73,  # M = 189.003
                      'om': 330.882,
                      'P': 1.887802},
            'objectId': str(uuid4()),
            'type': 'moon'}
        miranda = {
            'orbit': {'full_name': 'Miranda',
                      'a': 0.000868327867 * URANUS_MOON_EXAGGERATION,
                      'e': 0.0013,
                      'i': 4.338,
                      'w': 68.312,
                      'L': 706.08,  # M = 311.330
                      'om': 326.438,
                      'P': 1.413479},
            'objectId': str(uuid4()),
            'type': 'moon'}
        ariel = {
            'orbit': {'full_name': 'Ariel',
                      'a': 0.00127608768 * URANUS_MOON_EXAGGERATION,
                      'e': 0.0012,
                      'i': 0.041,
                      'w': 115.349,
                      'L': 177.224,  # M = 39.481
                      'om': 22.394,
                      'P': 2.520},
            'objectId': str(uuid4()),
            'type': 'moon'}
        umbriel = {
            'orbit': {'full_name': 'Umbriel',
                      'a': 0.00177810017 * URANUS_MOON_EXAGGERATION,
                      'e': 0.0039,
                      'i': 0.128,
                      'w': 84.709,
                      'L': 130.663,  # M = 12.469
                      'om': 33.485,
                      'P': 4.144},
            'objectId': str(uuid4()),
            'type': 'moon'}
        titania = {
            'orbit': {'full_name': 'Titania',
                      'a': 0.00291648536 * URANUS_MOON_EXAGGERATION,
                      'e': 0.0011,
                      'i': 1.079,
                      'w': 284.400,
                      'L': 404.785,  # M = 24.614
                      'om': 99.771,
                      'P': 8.706234},
            'objectId': str(uuid4()),
            'type': 'moon'}
        oberon = {
            'orbit': {'full_name': 'Oberon',
                      'a': 0.00390045659 * URANUS_MOON_EXAGGERATION,
                      'e': 0.0014,
                      'i': 0.068,
                      'w': 104.400,
                      'L': 667.259,  # M = 283.088
                      'om': 279.771,
                      'P': 13.463234},
            'objectId': str(uuid4()),
            'type': 'moon'}
        proteus = {
            'orbit': {'full_name': 'Proteus',
                      'a': 0.000786421621 * URANUS_MOON_EXAGGERATION,
                      'e': 0.0005,
                      'i': 0.026,
                      'w': 301.706,
                      'L': 581.446,  # M = 117.050
                      'om': 162.690,
                      'P': 1.12231477},
            'objectId': str(uuid4()),
            'type': 'moon'}
        triton = {
            'orbit': {'full_name': 'Triton',
                      'a': 0.00237169151 * URANUS_MOON_EXAGGERATION,
                      'e': 0.0,  # Yes, it's really 0.0
                      'i': 156.834,
                      'w': 344.046,
                      'L': 781.311,  # M = 264.834
                      'om': 172.431,
                      'P': -5.876854},
            'objectId': str(uuid4()),
            'type': 'moon'}
        nereid = {
            'orbit': {'full_name': 'Nereid',
                      'a': 0.0368548026 * URANUS_MOON_EXAGGERATION,
                      'e': 0.7512,
                      'i': 7.232,
                      'w': 280.830,
                      'L': 974.933,  # M = 359.341
                      'om': 334.762,
                      'P': 360.1362},
            'objectId': str(uuid4()),
            'type': 'moon'}

        self.bodies.append(mercury)
        self.bodies.append(callisto)
        self.bodies.append(deimos)
        self.bodies.append(earth)
        self.bodies.append(europa)
        self.bodies.append(ganymede)
        self.bodies.append(io)
        self.bodies.append(jupiter)
        self.bodies.append(saturn)
        self.bodies.append(luna)
        self.bodies.append(mars)
        self.bodies.append(phobos)
        self.bodies.append(venus)
        self.bodies.append(uranus)
        self.bodies.append(neptune)
        self.bodies.append(titan)
        self.bodies.append(rhea)
        self.bodies.append(iapetus)
        self.bodies.append(dione)
        self.bodies.append(tethys)
        self.bodies.append(miranda)
        self.bodies.append(ariel)
        self.bodies.append(umbriel)
        self.bodies.append(titania)
        self.bodies.append(oberon)
        self.bodies.append(proteus)
        self.bodies.append(triton)
        self.bodies.append(nereid)

        for body in self.bodies:
            if not 'epoch' in body['orbit']:
                body['orbit']['epoch'] = 2451545.0
                
            if body['orbit']['w'] is not None and body['orbit']['om'] is not None:
                body['orbit']['w_bar'] = body['orbit']['w'] + body['orbit']['om']

            if body['orbit']['w_bar'] is not None and body['orbit']['L'] is not None:
                body['orbit']['ma'] = body['orbit']['L'] - body['orbit']['w_bar']
        
            body['model'] = body['orbit']['full_name']
            body['owner'] = 'Mankind'

    def getBodies(self):
        return self.bodies