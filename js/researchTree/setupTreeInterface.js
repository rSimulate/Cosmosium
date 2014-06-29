techtree.canAfford = function(nodename){
    // Returns true if user can afford to research the given node, else returns false

        console.log('checking if user can afford this research (TODO)');
        
        return true; // TODO: check this through websockets and return result.
    
    };

techtree.researchNode = function(nodename){
        // Performs research action on given node.
        console.log('researching '+nodename+' (TODO)');
        
        // TODO: tell server to start this research
        
        // TODO: remove this next line (it's just for demo). This should by the message parser when the researchComplete message comes in from the server (see js/wsMessageParser.js for more).
        techtree.completeResearch(nodename);
    };