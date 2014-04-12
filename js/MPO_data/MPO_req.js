// MPO request for objects

// === helper functions ===
var strEq = function(str1,str2){
    try{
        return str1.toUpperCase() === str2.toUpperCase();
    } catch (err) {
        console.log("ERR: strEq("+str1+","+str2+")");
        throw err;
    }
};

// MPO classifications (types)
/*
var MPO_class = function(){
    this.MAIN_BELT = "main belt";
    this.NEO = "neo";
};
*/
var MPO_class = {
    MAIN_BELT : "main belt",
    NEO : "neo"
};

// === class def ===
var MPO_req = function(params) {
    console.log("init MPO_req with following params:");
    console.log(params);
    /*
    MPO_type = MPO classification
    ... others?
    telescope reslution?
    min magnitude viewable
    other tech-level things?
    ...
    asteroid composition?
    asteroid value range?
    asteroid mass range?
    */
    
    this.MPO_type = params.MPO_type;
    this.name = params.name;
    //debug console.log("name set to "+this.name)
    
    this.send = function(){
        // processes the request and returns a list of MPO objects
        
        // check for name first. if that is given, use it. Should only be 1 result.
        if (this.name){
            console.log("fetching data for "+this.name);
            // use    http://asterank.com/api/mpc?query={"readable_des":this.name}&limit=10
            var reqStr = 'http://asterank.com/api/mpc?query={"readable_des":"'+this.name+'"}&limit=2';
            var dat = {};
            console.log(reqStr);
            // NOTE: this next part is broken. I think it has something to do with the curly braces in reqStr.
            
            // $.getJSON(reqStr, function(data) { // does not work b/c cross-domain
            $.ajax({
                url: reqStr,
                // the name of the callback parameter, as specified by the service
                //jsonp: "callback",
                // tell jQuery we're expecting JSONP
                dataType: "jsonp",
                // tell site what we want and that we want JSON
                data: dat,
            //    data: {
            //        q: "select title,abstract,url from search.news where query=\"cat\"",
            //        format: "json"
            //    },
                error: function( jqXHR,  textStatus,  errorThrown){
                    console.log(textStatus);
                    console.log(errorThrown);
                },
                // work with the response
                success: function(dat){
                    console.log(dat);
                    // for each object in dat, create an MPO
                    // something like:
                    // this.result.append(new MPO(objectJSON))
                }
            });
        } else if (this.MPO_type){
        // check for general guidelines next...
            if (strEq(this.MPO_type, MPO_class.MAIN_BELT)){
                throw "NotImplementedError('main_belt_getter')"; // TODO!!!
            } else if (strEq(this.MPO_type, MPO_class.NEO)){
                throw "NotImplementedError('NEO getter')"; // TODO!!!
            } else {
                throw "unknown MPO type!";
            }
        } else {
            throw "cannot send with name="+this.name+", and type="+this.MPO_type;
        }
    };
};
