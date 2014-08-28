def getTraj(K1, K2, tlaunch, tarrive, N):
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
	from PyKEP import epoch, DAY2SEC, SEC2DAY, AU, DEG2RAD, MU_SUN, planet, lambert_problem, propagate_lagrangian

	#Create PyKEP epoch objects and calculate flight time 
	t1 = epoch(tlaunch,epoch.epoch_type.JD)
	t2 = epoch(tarrive,epoch.epoch_type.JD)
	dt = (t2.mjd2000 - t1.mjd2000) * DAY2SEC
	
	#First object
	K1[0] 	= epoch(K1[0],epoch.epoch_type.JD)	#convert epoch to PyKEP epoch object		
	K1[1] 	= K1[1] * AU 				#convert AU to meters       
	K1[3]   = K1[3] * DEG2RAD 			#convert angles from degrees to radians
	K1[4]	= K1[4] * DEG2RAD
	K1[5]	= K1[5] * DEG2RAD
	K1[6]	= K1[6] * DEG2RAD	
	K1[7] 	= K1[7] * 6.67384E-11			#convert mass to gravitational parameter mu
	OBJ1 	= planet(K1[0], K1[1:7], MU_SUN, K1[7], K1[8], K1[9])
	
	#Second object
	K2[0] 	= epoch(K2[0],epoch.epoch_type.JD)	#convert epoch to PyKEP epoch object		
	K2[1] 	= K2[1] * AU 				#convert AU to meters       
	K2[3]   = K2[3] * DEG2RAD 			#convert angles from degrees to radians
	K2[4]	= K2[4] * DEG2RAD
	K2[5]	= K2[5] * DEG2RAD
	K2[6]	= K2[6] * DEG2RAD	
	K2[7] 	= K2[7] * 6.67384E-11			#convert mass to gravitational parameter mu
	OBJ2 	= planet(K2[0], K2[1:7], MU_SUN, K2[7], K2[8], K2[9])
	
	#Calculate location of objects in flight path
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
	
	traj = [t, x, y, z]

	return traj
