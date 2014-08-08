from uuid import uuid4

REALNESS = 0


def scale(class_scale, real_scale, ideal_scale):
    return class_scale * (real_scale * REALNESS + ideal_scale * (1 - REALNESS))

PLANET_SIZE = scale(.1, 1, 250)  # = earth size in view scene length units
EARTH_SIZE = PLANET_SIZE
MARS_SIZE = scale(EARTH_SIZE, .53, .53)
JUPITER_SIZE = scale(EARTH_SIZE, 11, 2)

# exaggeration of moon orbit distances
ORBIT_DIST = scale(EARTH_SIZE, 1, .1)
# specific moon distance adjustments:
EARTH_MOON_EXAGGERATION = scale(ORBIT_DIST, 1, EARTH_SIZE)
MARS_MOON_EXAGGERATION = scale(ORBIT_DIST, 1, MARS_SIZE * 15)
JUPITER_MOON_EXAGGERATION = scale(ORBIT_DIST, 1, JUPITER_SIZE)


class BodyDB(object):
    def __init__(self):
        # http':#nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html
        # http':#ssd.jpl.nasa.gov/txt/aprx_pos_planets.pdf
        self.bodies = list()
        mercury = {
            'orbit': {'full_name': 'Mercury',
                      'ma': 174.79252722,
                      'epoch': 2451545.0,
                      'a': 0.38709927,
                      'e': 0.20563593,
                      'i': 7.00497902,
                      'w_bar': 77.45779628,
                      'w': 29.12703035,
                      'L': 252.25032350,
                      'om': 48.33076593,
                      'P': 87.969},
            'objectId': str(uuid4()),
            'type': 'planet'}
        venus = {
            'orbit': {'full_name': 'Venus',
                    'ma': 50.37663232,
                    'epoch': 2451545.0,
                    'a': 0.72333566,
                    'e': 0.00677672,
                    'i': 3.39467605,
                    'w_bar': 131.60246718,
                    'w': 54.92262463,
                    'L': 181.97909950,
                    'om': 76.67984255,
                    'P': 224.701},
            'objectId': str(uuid4()),
            'type': 'planet'}
        earth = {
            'orbit': {'full_name': 'Earth',
                    'ma': -2.47311027,
                    'epoch': 2451545.0,
                    'a': 1.00000261,
                    'e': 0.01671123,
                    'i': 0.00001531,
                    'w_bar': 102.93768193,
                    'w': 102.93768193,
                    'L': 100.46457166,
                    # om':-11.26064,
                    'om': 0,
                    'P': 365.256},
            'objectId': str(uuid4()),
            'type': 'planet'}
        mars = {
            'orbit': {'full_name': 'Mars',
                    'ma': 19.39019754,
                    'epoch': 2451545.0,
                    'a': 1.52371034,
                    'e': 0.09339410,
                    'i': 1.84969142,
                    'w_bar': -23.94362959,  # longitude of perihelion
                    'w': -73.5031685,  # argument of perihelion
                    'L': -4.55343205,  # mean longitude
                    'om': 49.55953891,  # longitude of ascending node
                    'P': 686.980},
            'objectId': str(uuid4()),
            'type': 'planet'}
        jupiter = {
            'orbit': {'full_name': 'Jupiter',
                    'ma': 19.66796068,
                    'epoch': 2451545.0,
                    'a': 5.20288700,
                    'e': 0.04838624,
                    'i': 1.30439695,
                    'w_bar': 14.72847983,
                    'w': -85.74542926,
                    'L': 34.39644051,
                    'om': 100.47390909,
                    'P': 4332.589},
            'objectId': str(uuid4()),
            'type': 'planet'}
        luna = {
            'orbit': {'full_name': 'Moon',
                    'ma': 135.27,
                    'epoch': 2451545.0,
                    'a': 0.00256955529 * EARTH_MOON_EXAGGERATION,  # exaggerating distance for visibility
                    'e': 0.0554,
                    'i': 5.16,
                    'w_bar': 83.23,
                    'w': 318.15,
                    'L': 13.176358,
                    'om': 125.08,
                    'P': 27.322},
            'objectId': str(uuid4()),
            'type': 'moon'}
        phobos = {
            'orbit': {'full_name': 'Phobos',
                    'ma': 91.059,
                    'epoch': 2451545.0,
                    'a': 6.26746889e-5 * MARS_MOON_EXAGGERATION,  # exaggerating distance for visibility
                    'e': 0.0151,
                    'i': 1.075,
                    'w_bar': 357.841,
                    'w': 150.057,
                    'L': 1128.8447569,
                    'om': 207.784,
                    'P': 0.3189},
            'objectId': str(uuid4()),
            'type': 'moon'}
        deimos = {
            'orbit': {'full_name': 'Deimos',
                    'ma': 325.329,
                    'epoch': 2451545.0,
                    'a': 0.000156807045 * MARS_MOON_EXAGGERATION,  # exaggerating distance for visibility
                    'e': 0.0002,
                    'i': 1.788,
                    'w_bar': 285.254,
                    'w': 260.729,
                    'L': 285.1618790,
                    'om': 24.525,
                    'P': 1.2624},
            'objectId': str(uuid4()),
            'type': 'moon'}
        ganymede = {
            'orbit': {'full_name': 'Ganymede',
                    'ma': 317.540,
                    'epoch': 2451545.0,
                    'a': 0.00715518206 * JUPITER_MOON_EXAGGERATION,  # exaggerating distance for visibility
                    'e': 0.0013,
                    'i': 0.177,
                    'w_bar': 255.969,
                    'w': 192.417,
                    'L': 50.3176072,
                    'om': 63.552,
                    'P': 7.155},
            'objectId': str(uuid4()),
            'type': 'moon'}
        io = {
            'orbit': {'full_name': 'Io',
                    'ma': 342.021,
                    'epoch': 2451545.0,
                    'a': 0.00281955885 * JUPITER_MOON_EXAGGERATION,  # exaggerating distance for visibility
                    'e': 0.0041,
                    'i': 0.036,
                    'w_bar': 128.106,
                    'w': 84.129,
                    'L': 203.4889583,
                    'om': 43.977,
                    'P': 1.769},
            'objectId': str(uuid4()),
            'type': 'moon'}
        europa = {
            'orbit': {'full_name': 'Europa',
                    'ma': 171.016,
                    'epoch': 2451545.0,
                    'a': 0.00448602642 * JUPITER_MOON_EXAGGERATION,  # exaggerating distance for visibility
                    'e': 0.0094,
                    'i': 0.466,
                    'w_bar': 308.076,
                    'w': 88.970,
                    'L': 101.3747242,
                    'om': 219.106,
                    'P': 3.551},
            'objectId': str(uuid4()),
            'type': 'moon'}
        callisto = {
            'orbit': {'full_name': 'Callisto',
                    'ma': 181.408,
                    'epoch': 2451545.0,
                    'a': 0.0125850722 * JUPITER_MOON_EXAGGERATION,  # exaggerating distance for visibility
                    'e': 0.0074,
                    'i': 0.192,
                    'w_bar': 351.491,
                    'w': 52.643,
                    'L': 21.5710728,
                    'om': 298.848,
                    'P': 16.69},
            'objectId': str(uuid4()),
            'type': 'moon'
            }

        self.bodies.append(mercury)
        self.bodies.append(callisto)
        self.bodies.append(deimos)
        self.bodies.append(earth)
        self.bodies.append(europa)
        self.bodies.append(ganymede)
        self.bodies.append(io)
        self.bodies.append(jupiter)
        self.bodies.append(luna)
        self.bodies.append(mars)
        self.bodies.append(phobos)
        self.bodies.append(venus)

        for body in self.bodies:
            print body
            if body['orbit']['w_bar'] is not None and body['orbit']['L'] is not None:
                body['orbit']['ma'] = body['orbit']['L'] - body['orbit']['w_bar']
        
            body['model'] = body['orbit']['full_name']
            body['owner'] = 'Mankind'

    def getBodies(self):
        return self.bodies