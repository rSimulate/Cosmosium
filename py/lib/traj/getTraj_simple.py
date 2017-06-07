__author__ = 'martin'


def getTraj_simple(start_planet, arrive_planet, tlaunch, tarrive, N):
    '''
	Finds a trajectory between two objects orbiting the Sun

	USAGE: traj = getTraj(K1, K2, tlaunch, tarrive)
		K:  		array of object parameters.
		epoch:		epoch of Keplerian orbital elements (JD)
		a:  	 	semimajor axis (AU)
		e:  	 	eccentricity (none)
		i:  	 	inclination (deg)
		om: 	 	longitude of the ascending node (deg)
		w:  	 	argument of perihelion (deg)
		ma: 	 	mean anomaly at epoch (deg)
		mass: 	 	mass of object (kg)
		r: 	 	radius of object (m)
		sr:	 	safe radius to approach object (m)
		K1: 	 	[epoch1,a1,e1,i1,om1,w1,ma1,mass1,r1,sr1]
		K2: 	 	[epoch2,a2,e2,i2,om2,w2,ma2,mass2,r2,sr2]
		tlaunch: 	launch time (JD)
		tarrive: 	arrival time (JD)
		N:		number of points in calculated trajectory

	'''
    import numpy as np
    from PyKEP import epoch, DAY2SEC, SEC2DAY, AU, DEG2RAD, MU_SUN, planet, lambert_problem, propagate_lagrangian, fb_vel

    # Create PyKEP epoch objects and calculate flight time
    t1 = epoch(tlaunch)
    t2 = epoch(tarrive)
    dt = (tarrive - tlaunch) * DAY2SEC

    rev=0 #number of revolutions before intercept


    OBJ1 = planet.jpl_lp(start_planet)
    OBJ2 = planet.jpl_lp(arrive_planet)  # Calculate location of objects in flight path
    r1, v1 = OBJ1.eph(t1)
    r2, v2 = OBJ2.eph(t2)

    #Find trajectory
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
    vin=l.get_v1()[rev]
    vout=l.get_v2()[rev]

    dV=fb_vel(vin,vout,planet.jpl_lp(arrive_planet))
    #dV=np.sqrt( np.square(vout[0])+np.square(vout[1])+np.square(vout[2]))-np.sqrt( np.square(vin[0])+np.square(vin[1])+np.square(vin[2]))

    return dV
