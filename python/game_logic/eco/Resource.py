'''
The resource class is used to handle computations around a single resource
'''
from time import time
from math import exp

class Resource(object):
    def __init__(self, val=0, scaler=10, lvl=0, bal=0):
        self.__value = val
        self.__growthScaler = scaler    # linearly scales the exponential growth function
        self.__growthLevel = lvl        # specifies current "tech level" which influencesgrowth
        self.__operationBalance = bal   # operationIncome - operationCost
        self.__epoch = int(time())
        self.__lastUpdate = self.__epoch
        
    def __call__(self,t=None):
        # returns value at time t. if no time given, returns current value
        if t == None:
            return self.getValue()
        elif t < self.__epoch:
            raise ValueError('cannot request resource value before resource creation')
        else: # t = time 
            return self.__value + self.getDelta()*int(t-self.__lastUpdate)
            
    def __add__(self,val):
        # overrides '+' operation to add to the resource
        self.__value += val
        return self
    
    def __sub__(self,val):
    # overrides '-' operation to subtract from the resource
        self.__value -= val    
        return self
        
    def getValue(self):
        self.__update()
        return self.__value
        
    def getDelta(self):
        return int(self.__growthScaler*exp(self.__growthLevel) + self.__operationBalance)

    def modRate(self,percent):
        '''
        modifies the growth scaler by given percent (between 0-1) increase/decrease.
        useful for research purchases which improve growth or similar.
        '''
        self.__growthScaler *= (1.0+percent)
        
    def addCost(self,value):
        '''
        adds operational cost
        '''
        self.__operationBalance-=value
    
    def addIncome(self,value):
        '''
        adds source of income
        '''
        self.__operationBalance+=value
        
    # private:    
    def getTimeElapsed(self):
        # returns the number of seconds elapsed since last update
        return int(time()) - self.__lastUpdate    
    
    def __update(self):
        # computes updated values for all resources
        now = int(time())
        self.__value+=int(self.getDelta()*(now-self.__lastUpdate))
        self.__lastUpdate = now