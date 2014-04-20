# static functions for returning the cost of items

from python.game_logic.Cost import Cost

def getCost(item, user=None):
    # returns cost dict for given item name & given user
    try:
        if item in baseCostMap:
            return baseCostMap[item]
        else:
            raise ValueError('unknown item "'+str(item)+'"')
    except TypeError as e:
        print 'item='+str(item)
        raise e
    
# named items:
baseCostMap = {'asteroidTrack':Cost(100,1000,100,10,10),
            'techUpgrade':Cost(1000,1000,1000,100,10)
            }