__author__ = 'martin'

import py.AsteroidDB as asteroidDB
import numpy as np
from PyKEP import epoch, DAY2SEC, SEC2DAY, AU, DEG2RAD, MU_SUN, planet_ss, lambert_problem, propagate_lagrangian, \
    fb_vel, planet_mpcorb, planet
from py.jdutil import *
from PyKEP import epoch, DAY2SEC, SEC2DAY, AU, DEG2RAD, MU_SUN, planet, lambert_problem, propagate_lagrangian


def planet_planet(start_planet, arrive_planet, tlaunch, tarrive, rev, N):
    # Create PyKEP epoch objects and calculate flight time
    t1 = epoch(tlaunch)
    t2 = epoch(tarrive)
    dt = (tarrive - tlaunch) * DAY2SEC

    OBJ1 = planet_ss(start_planet)
    OBJ2 = planet_ss(arrive_planet)  # Calculate location of objects in flight path
    r1, v1 = OBJ1.eph(t1)
    r2, v2 = OBJ2.eph(t2)

    # Find trajectory
    l = lambert_problem(r1, r2, dt, MU_SUN)

    #extract relevant information from solution
    r = l.get_r1()
    v = l.get_v1()[0]
    mu = l.get_mu()

    #define the integration time
    dtn = dt / (N - 1)
    dtn_days = dtn * SEC2DAY

    #alocate the cartesian components for r
    t = np.array([0.0] * N)
    x = np.array([0.0] * N)
    y = np.array([0.0] * N)
    z = np.array([0.0] * N)

    #calculate the spacecraft position at each dt
    for i in range(N):
        t[i] = tlaunch + dtn_days * i
        x[i] = r[0] / AU
        y[i] = r[1] / AU
        z[i] = r[2] / AU
        r, v = propagate_lagrangian(r, v, dtn, mu)

    #traj = [t, x, y, z]
    vin = l.get_v1()[rev]
    vout = l.get_v2()[rev]

    #dV=fb_vel(vin,vout,planet_ss(arrive_planet))
    #dV=np.sqrt( np.square(vin[0]/vout[0])+np.square(vin[1]/vout[1])+np.square(vin[2]/vout[2]))

    #dV=np.sqrt( np.square(vin[0]-v1[0])+np.square(v1[1]-vin[1])+np.square(v1[2]-vin[2]))
    #dV=np.sqrt( np.square(v2[0]-vout[0])+np.square(v2[1]-vout[1])+np.square(v2[2]-vout[2]))
    #dV=np.sqrt( np.square(v1[0]/vin[0])+np.square(v1[1]/vin[1])+np.square(v1[2]/vin[2]))

    C3_launch = (np.sqrt(np.square(vin[0] - v1[0]) + np.square(vin[1] - v1[1]) + np.square(vin[2] - v1[2]))) ** 2
    C3_arrive = (np.sqrt(np.square(vout[0] - v2[0]) + np.square(vout[1] - v2[1]) + np.square(vout[2] - v2[2]))) ** 2

    C3 = np.sqrt((C3_arrive ** 2) + (C3_launch ** 2))
    return C3


def planet_asteroid(start_planet, target_name, tlaunch, tarrive, rev, N):
    # Create PyKEP epoch objects and calculate flight time
    t1 = epoch(tlaunch)
    t2 = epoch(tarrive)
    dt = (tarrive - tlaunch) * DAY2SEC

    import py.AsteroidDB as asteroidDB


    neo_db = asteroidDB.neo

    target = (item for item in neo_db if item["name"] == target_name).next()

    ep = epoch(target["epoch_mjd"], epoch.epoch_type.MJD)
    a = target["a"] * AU
    e = target["e"]
    i = target["i"] * DEG2RAD
    om = target["om"] * DEG2RAD
    w = target["w"] * DEG2RAD
    ma = target["ma"] * DEG2RAD
    as_mu = 1E17 * 6.67384E-11  # maybe need to calculate actual mass from density and radius
    r = (target["diameter"] / 2) * 1000
    sr = r * 1.1

    OBJ2 = planet(ep, (a, e, i, om, w, ma), MU_SUN, as_mu, r, sr)
    OBJ1 = planet_ss(start_planet)  # Calculate location of objects in flight path
    r1, v1 = OBJ1.eph(t1)
    r2, v2 = OBJ2.eph(t2)

    # Find trajectory
    l = lambert_problem(r1, r2, dt, MU_SUN)

    #extract relevant information from solution
    r = l.get_r1()
    v = l.get_v1()[rev]
    mu = l.get_mu()

    #define the integration time
    dtn = dt / (N - 1)
    dtn_days = dtn * SEC2DAY

    #alocate the cartesian components for r
    t = np.array([0.0] * N)
    x = np.array([0.0] * N)
    y = np.array([0.0] * N)
    z = np.array([0.0] * N)

    #calculate the spacecraft position at each dt
    for i in range(N):
        t[i] = tlaunch + dtn_days * i
        x[i] = r[0] / AU
        y[i] = r[1] / AU
        z[i] = r[2] / AU
        r, v = propagate_lagrangian(r, v, dtn, mu)

    #traj = [t, x, y, z]
    vin = l.get_v1()[rev]
    vout = l.get_v2()[rev]

    #dV=fb_vel(vin,vout,planet_ss(arrive_planet))
    #dV=np.sqrt( np.square(vin[0]/vout[0])+np.square(vin[1]/vout[1])+np.square(vin[2]/vout[2]))

    #dV=np.sqrt( np.square(vin[0]-v1[0])+np.square(v1[1]-vin[1])+np.square(v1[2]-vin[2]))
    #dV=np.sqrt( np.square(v2[0]-vout[0])+np.square(v2[1]-vout[1])+np.square(v2[2]-vout[2]))
    #dV=np.sqrt( np.square(v1[0]/vin[0])+np.square(v1[1]/vin[1])+np.square(v1[2]/vin[2]))

    C3_launch = (np.sqrt(np.square(vin[0] - v1[0]) + np.square(vin[1] - v1[1]) + np.square(vin[2] - v1[2]))) ** 2
    C3_arrive = (np.sqrt(np.square(vout[0] - v2[0]) + np.square(vout[1] - v2[1]) + np.square(vout[2] - v2[2]))) ** 2

    C3 = np.sqrt((C3_arrive ** 2) + (C3_launch ** 2))
    return C3


def traj_planet_asteroid(start_planet, target_name, tlaunch, tarrive, rev, N):
    t1 = epoch(tlaunch)
    t2 = epoch(tarrive)
    dt = (tarrive - tlaunch) * DAY2SEC

    import py.AsteroidDB as asteroidDB


    neo_db = asteroidDB.neo

    target = (item for item in neo_db if item["name"] == target_name).next()

    ep = epoch(target["epoch_mjd"], epoch.epoch_type.MJD)
    a = target["a"] * AU
    e = target["e"]
    i = target["i"] * DEG2RAD
    om = target["om"] * DEG2RAD
    w = target["w"] * DEG2RAD
    ma = target["ma"] * DEG2RAD
    as_mu = 1E17 * 6.67384E-11  # maybe need to calculate actual mass from density and radius
    r = (target["diameter"] / 2) * 1000
    sr = r * 1.1

    OBJ2 = planet(ep, (a, e, i, om, w, ma), MU_SUN, as_mu, r, sr)
    OBJ1 = planet_ss(start_planet)

    # Calculate location of objects in flight path
    r1, v1 = OBJ1.eph(t1)
    r2, v2 = OBJ2.eph(t2)

    #Find trajectory
    l = lambert_problem(r1, r2, dt, MU_SUN)

    #extract relevant information from solution
    r = l.get_r1()
    v = l.get_v1()[0]
    mu = l.get_mu()  #define the integration time
    dtn = dt / (N - 1)
    dtn_days = dtn * SEC2DAY

    #alocate the cartesian components for r
    t = np.array([0.0] * N)
    x = np.array([0.0] * N)
    y = np.array([0.0] * N)
    z = np.array([0.0] * N)

    #calculate the spacecraft position at each dt
    for i in range(N):
        t[i] = tlaunch + dtn_days * i
        x[i] = r[0] / AU
        y[i] = r[1] / AU
        z[i] = r[2] / AU
        r, v = propagate_lagrangian(r, v, dtn, mu)

    traj = [t, x, y, z]

    return traj





    #junk:
    #search_string=str(target["id"])+" "+str(target["H"]) +" "+str(target["G"])+" "+str(mjd_to_iau(target["epoch"]))+" "+str(target["ma"])+" "+str(target["w"])+" "+str(target["om"])+" "+str(target["i"])+" "+str(target["e"])+" "+str(target["n"])+" "+str(target["a"])+" "+str(target["rms"])
    #    search_string2="04581   20.7   0.15 K145N 189.78193  255.30141  180.29876    4.91898  0.3570250  0.95339205   1.0224020  0 MPO270214   144   5 1989-2013 "
    #    #non essential components: 0.54 M-v 3Eh MPCW (4581) Asclepius 20130822
    #    print search_string
    #    print search_string2
