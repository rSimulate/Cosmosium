'''
The resource class is used to handle computations around a single resource
'''
from time import time
from math import exp

class Cost(object):
    ''' 
    one set of values for a particular resource
    made up of two parts:
      * 1-time value increase/decrease(cost)
      * recurring value increase/decrease
    '''
    def __init__(self, oneTime, recurring):
        self.oneTime = oneTime
        self.recurring = recurring

class Resource(object):
    def __init__(self, val=0, scaler=10, lvl=0, bal=0):
        self._value = val
        self._growthScaler = scaler    # linearly scales the exponential growth function
        self._growthLevel = lvl        # specifies current "tech level" which influencesgrowth
        self._operationBalance = bal   # operationIncome - operationCost
        self._epoch = int(time())
        self._lastUpdate = self._epoch
        
    def __call__(self,t=None):
        # returns value at time t. if no time given, returns current value
        if t == None:
            return self.getValue()
        elif t < self._epoch:
            raise ValueError('cannot request resource value before resource creation')
        else: # t = time
            return self._value + self.getDelta()*int(t-self._lastUpdate)
            
    def applyCost(self,cost):
        ''' adds/subtracts Cost objects from the resource '''
        self._value += cost.oneTime
        self._operationBalance+=cost.recurring
        
    def getValue(self):
        self._update()
        return self._value
        
    def getDelta(self):
        return int(self._growthScaler*exp(self._growthLevel) + self._operationBalance)

    def modRate(self,percent):
        '''
        modifies the growth scaler by given percent (between 0-1) increase/decrease.
        useful for research purchases which improve growth or similar.
        '''
        self._growthScaler *= (1.0+percent)
        
    def addCost(self,value):
        '''
        adds operational cost (recurring credit)
        '''
        self._operationBalance-=value
    
    def addIncome(self,value):
        '''
        adds source of income (recurring debt)
        '''
        self._operationBalance+=value
        
    # private:    
    def getTimeElapsed(self):
        # returns the number of seconds elapsed since last update
        return int(time()) - self._lastUpdate    
    
    def _update(self):
        # computes updated values for all resources
        now = int(time())
        self._value+=int(self.getDelta()*(now-self._lastUpdate))
        self._lastUpdate = now
