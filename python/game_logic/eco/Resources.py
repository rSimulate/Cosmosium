'''
Resources class handles all things related to user resources
'''

from time import time

from python.game_logic.eco.Resource import Resource, Cost

class Balance(object):
    '''
    a set of costs for each resource 
    '''
    def __init__(self, science=Cost(0,0), wealth=Cost(0,0), metals=Cost(0,0), energy=Cost(0,0), organic=Cost(0,0)):
        self.science=science
        self.wealth =wealth
        self.metals =metals
        self.energy =energy
        self.organic=organic
        
    def __neg__(self):
        # inverts all values
        return Balance(science=Cost(-self.science.oneTime, -self.science.recurring)
            ,wealth=Cost(-self.wealth.oneTime, -self.wealth.recurring)
            ,metals=Cost(-self.metals.oneTime, -self.metals.recurring)
            ,energy=Cost(-self.energy.oneTime, -self.energy.recurring)
            ,organic=Cost(-self.organic.oneTime, -self.organic.recurring))

        

class Resources(object):
    def __init__(self):
        self.science= Resource(bal=1)
        self.wealth = Resource(bal=7)
        self.energy = Resource(bal=5)
        self.metals = Resource(bal=5)
        self.organic= Resource(bal=11)
        
        self._lastUpdate = int(time())
        
    def applyBalance(self,bal):
        '''
        deducts/adds costs for each resource as defined by given Balance object
        '''
        self.science.applyCost(bal.science)
        self.wealth.applyCost(bal.wealth)
        self.metals.applyCost(bal.metals)
        self.energy.applyCost(bal.energy)
        self.organic.applyCost(bal.organic)    
        
    ### DEPRECIATED METHODS (DONT USE, REMOVE IF POSSIBLE) ###
    def getScience(self, player):
        # DEPRECIATED! Use return statement directly in future.
        #returns current amout of science
        return self.science()
        
    def getWealth(self, player):
        #returns current amout of science
        # DEPRECIATED! Use return statement directly in future.
        return self.wealth()
        
    def getEnergy(self, player):
        #returns current amout of energy
        # DEPRECIATED! Use return statement directly in future.
        return self.energy()
        
    def getMetals(self, player):
        #returns current amout of metals
        # DEPRECIATED! Use return statement directly in future.
        return self.metals()

    def getOrganic(self, player):
        # returns current amount of organic
        # DEPRECIATED! Use return statement directly in future.
        return self.organic()
        
    def getLife(self, player):
        # DEPRECIATED alias for getOrganic
        return self.getOrganic()
        
    def getDeltaWealth(self, player):
        # returns estimated increase/s for the js client
        # DEPRECIATED! Use return statement directly in future.
        return self.wealth.getDelta()
                
    def getDeltaScience(self, player):
        # returns estimated increase/s for the js client
        # DEPRECIATED! Use return statement directly in future.
        return self.science.getDelta()
        
    def getDeltaMetals(self, player):
        # returns estimated increase/s for the js client
        # DEPRECIATED! Use return statement directly in future.
        return self.metals.getDelta()
        
    def getDeltaEnergy(self, player):
        # returns estimated increase/s for the js client
        # DEPRECIATED! Use return statement directly in future.
        return self.energy.getDelta()
    
    def getDeltaOrganic(self, player):
        # returns estimated increase/s for the js client
        # DEPRECIATED! Use return statement directly in future.
        return self.organic.getDelta()
        
    def update(self, player):
        # computes updated values for all resources
        # DEPRECIATED! No use for all-resource updates, right?
        self.science.__update()
        self.wealth.__update()
        self.metals.__update()
        self.energy.__update()
        self.organic.__update()
        self._lastUpdate = int(time())
        
    
