// player module which should be used to hold data about the player

player = {
    science: {{user.resources.science()}},
    wealth:  {{user.resources.wealth()}},
    energy:  {{user.resources.energy()}},
    metal:   {{user.resources.metals()}},
    organic:  {{user.resources.organic()}},

    dScience: {{user.resources.getDeltaScience(user)}},
    dWealth:  {{user.resources.getDeltaWealth(user)}},
    dEnergy:  {{user.resources.getDeltaEnergy(user)}},
    dMetal:   {{user.resources.getDeltaMetals(user)}},
    dOrganic: {{user.resources.getDeltaOrganic(user)}},

    canAfford: function(cost){
        // returns true if player has enough resources to afford the item
        if (   player.science >= cost.science
            && player.wealth  >= cost.wealth
            && player.energy  >= cost.energy
            && player.metal   >= cost.metal
            && player.organic >= cost.organic){
            return true;
        } else {
            return false;
        }
    },

    // resource value updaters
    uScience: function(){
        player.science += player.dScience;
        document.getElementById('science').innerHTML = player.science;
    },
    uWealth: function(){
        player.wealth += player.dWealth;
        document.getElementById('wealth').innerHTML = player.wealth;
    },
    uEnergy: function(){
        player.energy += player.dEnergy;
        document.getElementById('energy').innerHTML = player.energy;
    },
    uMetal: function(){
        player.metal += player.dMetal;
        document.getElementById('metals').innerHTML = player.metal;
    },
    uOrganic: function(){
        player.organic += player.dOrganic;
        document.getElementById('organic').innerHTML = player.organic;
    }
}