'''
 static functions and values for returning the cost of items
 This should be replaced by a database soon...
'''

from python.game_logic.eco.Resources import Balance
from python.game_logic.eco.Resource import Cost

def getCost(item, user=None):
    '''
    returns cost dict for given item name & given user
    this is useful for purchases which change value depending on user state, such as techUpgrades or researches
    '''
    try:
        if item in baseCostMap:
            return baseCostMap[item]
        else:
            raise ValueError('unknown item "'+str(item)+'"')
    except TypeError as e:
        print 'item='+str(item)
        raise e
    
# named items:
baseCostMap = {'asteroidTrack':Balance(science=Cost(0,2), metals=Cost(-100,   -2), energy=Cost(-100,-10), organic=Cost(-100,-1)),
                 'research_techLevel':Balance(science=Cost(-1000, -0), energy=Cost(-100,0), organic=Cost(-100,0))
            }
