function updateAll(){
    console.log('updating resource values');
    uScience();
    uWealth();
    uEnergy();
    uMetals();
    uOrganic();
}
    
function uScience(){
    document.getElementById('science').innerHTML = 
        parseInt(document.getElementById('science').innerHTML) + {{user.resources.getDeltaScience(user)}};
}
function uWealth(){
    document.getElementById('wealth').innerHTML = 
        parseInt(document.getElementById('wealth').innerHTML) + {{user.resources.getDeltaWealth(user)}};
}
function uEnergy(){
    document.getElementById('energy').innerHTML = 
        parseInt(document.getElementById('energy').innerHTML) + {{user.resources.getDeltaEnergy(user)}};
}
function uMetals(){
    document.getElementById('metals').innerHTML = 
        parseInt(document.getElementById('metals').innerHTML) + {{user.resources.getDeltaMetals(user)}};
}
function uOrganic(){
    document.getElementById('organic').innerHTML = 
        parseInt(document.getElementById('organic').innerHTML) + {{user.resources.getDeltaOrganic(user)}};
}