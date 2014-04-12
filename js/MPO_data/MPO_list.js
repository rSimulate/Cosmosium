// This is the container for all MPOs currently being managed in the client.

var MPO_list = function() {
    this.MPO_count = 0;
    this.MPOs=[];
    
    this.add = function(newMPOs){
        try{
            // adds a list of MPO objects to the list
            newMPOs.forEach(function(mpo){
                console.log(this.MPOs);
                this.MPOs.push(mpo);
                this.MPO_count += 1;
            });
        } catch (err){
            if (err == TypeError){
                console.warn("MPO_list recieved non-list");
                this.add([newMPOs]);
            }else{
                throw err;
            }
        }
    };
};
