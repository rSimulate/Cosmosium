'''
Resources class handles all things related to user resources
'''

from math import exp
from time import time

class Resources(object):
    def __init__(self):
        self.science= 0 
        self.wealth = 0
        self.energy = 0
        self.metals = 0
        self.organic= 0
        
        self.lastUpdate = int(time())
        
    def getScience(self, player):
        #returns current amout of science
        self.update(player)
        return self.science
        
    def getWealth(self, player):
        #returns current amout of science
        self.update(player)
        return self.wealth
        
    def getEnergy(self, player):
        #returns current amout of energy
        self.update(player)
        return self.energy   
        
    def getMetals(self, player):
        #returns current amout of metals
        self.update(player)
        return self.metals         

    def getOrganic(self, player):
        # returns current amount of organic
        self.update(player)
        return self.organic
        
    def getLife(self, player):
        # DEPRECIATED alias for getOrganic
        return self.getOrganic()

        
    def getDeltaWealth(self, player):
        # returns estimated increase/s for the js client
        return int(exp(player.research.age)*10)
                
    def getDeltaScience(self, player):
        # returns estimated increase/s for the js client
        # dScience = multiplier * e^(exponential) + linearIncrease
        sciGrowthConst = 10
        baseGrowth = sciGrowthConst*exp(player.research.age)
        boosts = 1
        operateCosts = -1
        return sciGrowthConst*baseGrowth + boosts - operateCosts
        
    def getDeltaMetals(self, player):
        # returns estimated increase/s for the js client
        return int(exp(player.research.age)*10)
        
    def getDeltaEnergy(self, player):
        # returns estimated increase/s for the js client
        return int(exp(player.research.age)*10)
    
    def getDeltaOrganic(self, player):
        # returns estimated increase/s for the js client
        return int(exp(player.research.age)*10)
        
    def update(self, player):
            # computes updated values for all resources
        self.science=int(self.getDeltaScience(player)*self.getTimeElapsed())
        self.wealth= int(self.getDeltaWealth(player) *self.getTimeElapsed())
        self.energy= int(self.getDeltaEnergy(player) *self.getTimeElapsed())
        self.metals= int(self.getDeltaMetals(player) *self.getTimeElapsed())
        self.organic=int(self.getDeltaOrganic(player)   *self.getTimeElapsed())
        
    def getTimeElapsed(self):
        # returns the number of seconds elapsed since last update
    #    print '\n\n',time(),' - ', self.lastUpdate,'\n\n'
        return int(time()) - self.lastUpdate
    