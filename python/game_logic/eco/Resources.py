'''
Resources class handles all things related to user resources
'''

from time import time

from python.game_logic.eco.Resource import Resource

class Resources(object):
    def __init__(self):
        self.science= Resource(scaler=7)
        self.wealth = Resource(scaler=47)
        self.energy = Resource(scaler=10)
        self.metals = Resource(scaler=9)
        self.organic= Resource(scaler=11)
        
        self.__lastUpdate = int(time())
        
        
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
        self.__lastUpdate = int(time())
        
    