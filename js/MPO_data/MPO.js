// Minor Planetary Object (MPO) aka asteroid class

var MPO = function(params) {
    if (params.database=="asterank"){
        this.readable_des = params.name;
        this.magnitude = params.H;

/*
 === ORBITAL ELEMENTS ===
 (from http://en.wikipedia.org/wiki/Orbital_elements)
The main two elements that define the shape and size of the ellipse:
* Eccentricity (e\,\!) - shape of the ellipse, describing how much it is elongated compared to a circle. (not marked in diagram)
* Semimajor axis (a\,\!) - the sum of the periapsis and apoapsis distances divided by two. For circular orbits, the semimajor axis is the distance between the centers of the bodies, not the distance of the bodies from the center of mass.
*/
        this.eccentricity = params.e;
        this.semi_major_axis = params.a;
/*
Two elements define the orientation of the orbital plane in which the ellipse is embedded:
* Inclination - vertical tilt of the ellipse with respect to the reference plane, measured at the ascending node (where the orbit passes upward through the reference plane) (green angle i in diagram).
* Longitude of the ascending node - horizontally orients the ascending node of the ellipse (where the orbit passes upward through the reference plane) with respect to the reference frame's vernal point (green angle O in diagram).
*/
        this.inclination = params.i;
        this.node = params.node; //long_of_ascending_node
/*
Finally:
* Argument of periapsis defines the orientation of the ellipse in the orbital plane, as an angle measured from the ascending node to the periapsis (the closest point the second body comes to the first during an orbit). (blue angle \omega\,\! in diagram)
* Mean anomaly at epoch (M_o\,\!) defines the position of the orbiting body along the ellipse at a specific time (the "epoch").
*/
        this.arg_of_parihelion = params.peri;
        this.mean_anomaly = params.M;
        
//  other orbital elements:
        this.perihelion = params.q;
        this.time_of_perihelion_passage = params.tp; // it's written t_p... i mean... t (sub) p. Need to check this one if to be used.
        this.period = params.period;
        this.mean_motion = params.n;
        this.aphelion_dist = params.Q;
    } else if (params.database == "NEO_flat_file"){
    
    } else {
        console.warn("MPO declared without database param");
    }

// === LOCATION ELEMENTS === 
// (for easy initial insertion into the scene)
    this.x = 0;
    this.y = 0;
    this.z = 0;
    
// === PHYSICAL CHARACTERISTICS ===
    this.mass = 0;
    this.val = 0;
    this.type = "metallic";
    
// === PLAYER RELATIONSHIP ===
    this.claimedBy = "nobody";
    
    this.getLoc = function(t) {
        // get x y z at given time, assuming the sun is at 0,0,0
        var polar = this.getPolar(t);
        var xy = this.polar2cartesian(polar.r, polar.theta);
        this.x = xy.x;
        this.y = 0;
        this.z = xy.y;  // NOTE: y & z flipped b/c y is usually "up". we just computed on the 2d solar plane as xy, now solar plane is xz.
        return {"x":this.x,"y":this.y,"z":this.z};
    };
    
    this.getPolar = function(t){
        // returns location of MPO in polar coordinates at time t (neglecting z axis)
        
        // assume orbit is circular, using only semi-major axis and mean anomaly (for now)
        var radius = this.semi_major_axis;
        var theta  = this.mean_anomaly;     //TODO: handle the problem of different epoch times (see get_mean_anomaly_at()).
        theta += (t%this.period)*Math.PI;
        return {"r":radius,"theta":theta};
    }
    
    this.polar2cartesian = function(R, theta) {
        x = R * Math.cos(theta);
        y = R * Math.sin(theta);
        return {"x":x,"y":y};
    }
    
    this.getMeanAnomalyAt = function(epoch){
        // returns mean anomaly specific to given epoch time
        throw "NotImplementedError('getMeanAnomalyAt')"; // TODO!!!
    }
    
    this.claim = function(playerID){
        // allows player to claim asteroid for themselves
        this.claimedBy = playerID;
        throw "NotImplementedError('"+playerID+" cannot claim')"; // TODO!!!
    };

};
