# static functions for returning the cost of items

from python.game_logic.eco.Resources import Balance
from python.game_logic.eco.Resource import Cost

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
baseCostMap = {'asteroidTrack':{'science':0  ,'wealth':0,'metals':5,'energy':50,'organic':10},
                 'techUpgrade':{'science':100,'wealth':0,'metals':0,'energy':0,'organic':0}
            }
