techtree.getCost = function(nodename){
    // returns the cost to research the given node
    // TODO: get this from a database or something...
    return {science:10000, wealth:0, energy:5000, metal:2000, organic:1000};
};

techtree.canAfford = function(nodename){
    // Returns true if user can afford to research the given node, else returns false

        console.log('checking if user can afford this research...');

        if (player.canAfford(techtree.getCost(nodename))){
            return true;
        } else {
            return false;
        }
};

techtree.researchNode = function(nodename){
        // Performs research action on given node.
        console.log('researching '+nodename+' (TODO)');
        
        // tell server to start this research
        message('research', nodename);

        // TODO: remove this next line (it's just for demo). This should by the message parser when the researchComplete message comes in from the server (see js/wsMessageParser.js for more).
        techtree.completeResearch(nodename);
};