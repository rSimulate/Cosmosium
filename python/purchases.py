# static functions for returning the cost of items



def getCost(item, user=None):
    # returns cost dict for given item name & given user
    return baseCostMap[item]
    
def Cost(sci, weal, ener, met, org):
    # returns cost dict for given values
    # (shorthand func for convenience)
    return {'science':sci,'wealth':weal,'energy':ener,'metals':met,'organic':org}
    
# named items:
baseCostMap = {'asteroidTrack':Cost(100,1000,100,10,10),
            'techUpgrade':Cost(1000,1000,1000,100,10)
            }