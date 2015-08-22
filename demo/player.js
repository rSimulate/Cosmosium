/**
 * Created by tylar on 8/22/15.
 */

// player module which should be used to hold data about the player

player = {
    science: Math.round(Math.random()*10000),
wealth:  Math.round(Math.random()*10000),
energy:  Math.round(Math.random()*10000),
metal:   Math.round(Math.random()*10000),
organic:  Math.round(Math.random()*10000),

dScience: Math.round(Math.random()*10),
dWealth:  Math.round(Math.random()*10),
dEnergy:  Math.round(Math.random()*10),
dMetal:   Math.round(Math.random()*10),
dOrganic: Math.round(Math.random()*10),

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