from math import exp
from time import time

from python.page_maker.Message import Message
from python.page_maker.Note import Note
from python.page_maker.Task import Task
from python import purchases

class Resources(object):
    def __init__(self):
        self.science= 0 
        self.wealth = 0
        self.energy = 0
        self.metals = 0
        self.organic= 0
       
        
class Miner(object):
    def __init__(self):
        self.techLevel=0
        self.busy=False
        self.ttc=0 #time to completion
        
        
class Telescope(object):
    def __init__(self):
        self.techLevel=0
        self.busy=False
        self.ttc=0 #time to completion
        
class Research(object):
    def __init__(self):
        # "age"??? overall summary of state of science... "internet age", "space age"... idk...
        self.age=0
        
        # for modulating task values
        self.telescopeLevel=0
        self.minerLevel=0
        
        # coeffs
        self.EnergyScienceLevel=0   # energy output
        self.manufactureLevel=0     # build efficiency
        self.lifeScienceLevel=0     # life growth
        self.propultionTechLevel=0  # fuel use & generation abilities


class User(object):
    def __init__(self):
        ### USER PROFILE DATA ###
        self.name = 'Johannes Kepler'
        self.icon = "img/avatar3.png"
        self.agency = 'NASA'
        self.subtext = 'forger of worlds'
        self.profile_link = '#'
        
        self.history_text = "Game History"
        self.history_link = "#"
        self.stats_text = "Stats"
        self.stats_link = "#"
        self.thing3_text = "More"
        self.thing3_link = "#"
        
        self.messages = [Message(),Message()]
        self.notes = [Note()]
        self.tasks = [Task(),Task(),Task(),Task()]
        
        
        ### USER GAME LOGIC DATA ###
        self.lastUpdate = int(time())
        
        self.resources = Resources()
        
        self.research  = Research()
        
        self.telescopes = list([Telescope(),Telescope()]) #start w/ 2 telescopes
        
        self.miners    = [Miner()]  #start w/ 1 miner
        
        
        
    def affords(self,item):
        # returns true if can afford given item description
        # itemDesc can be a dict with cost values, or a string descriptor
        try:
            return item['science'] < self.getScience()\
                and item['wealth'] < self.getWealth()\
                and item['energy'] < self.getEnergy()\
                and item['metals'] < self.getMetals()\
                and item['organic']< self.getOrganic()
        except TypeError: # if not a dict
            return self.affords(purchases.getCost(item))

                
    def payFor(self,item):
        # deducts item cost from resources,
        # returns true if purchase is sucessful 
        try:      
            temp = item['science'] < self.getScience()\
                and item['wealth'] < self.getWealth()\
                and item['energy'] < self.getEnergy()\
                and item['metals'] < self.getMetals()\
                and item['organic']< self.getOrganic()
            cost = item
        except TypeError: # if not a dict
            cost = purchases.getCost(item)
            
        self.resources.science -= cost['science']
        self.resources.wealth  -= cost['wealth']
        self.resources.energy  -= cost['energy']
        self.resources.metals  -= cost['metals']
        self.resources.organic -= cost['organic']    
        return True

    ### RESEARCHING (science) ###
    def getTechImage(self, level=None):
        # returns image file name for given techlevel, else returns for current mine techLevel
        # TODO: check that file exists
        if level==None:
            return 'img/tech/tech'+str(self.research.minerLevel)+'.jpg'
        else:
            return 'img/tech/tech'+str(level)+'.jpg'
            
    def getDeltaScience(self):
        # returns estimated increase/s for the js client
        return int(exp(self.research.age)*10)
            
    ### ASTRONOM-IZING ###
    def addTele(self):
        self.telescopes.append(Telescope())
        
    ### MINING ($$$ and metals) ###
    def getDeltaWealth(self):
        # returns estimated increase/s for the js client
        return int(exp(self.research.age)*10)
        
    def getDeltaMetals(self):
        # returns estimated increase/s for the js client
        return int(exp(self.research.age)*10)
        
    def getMineImage(self, level=None):
        # returns image file name for given techlevel, else returns for current mine techLevel
        # TODO: check that file exists
        if level==None:
            return 'img/mining/tech'+str(self.research.minerLevel)+'.jpg'
        else:
            return 'img/mining/tech'+str(level)+'.jpg'

    def getMinersCount(self, level=None):
        # returns count of miner units in given techlevel
        if(level==None):
            return len(self.miners)
        else:
            return sum(miner.techLevel == level for miner in self.miners)
        
    def addMiner(self):
        self.miners.append(Miner())
        
    ### ENERG-IZING (energy) ###
    def getDeltaEnergy(self):
        # returns estimated increase/s for the js client
        return int(exp(self.research.age)*10)
    
    ### COLONIZING (organic/life) ###
    def getDeltaOrganic(self):
        # returns estimated increase/s for the js client
        return int(exp(self.research.age)*10)
    
    ### MORE ###
    def update(self):
        # computes updated values for all resources
        self.resources.science=int(self.getDeltaScience()*self.getTimeElapsed())
        self.resources.wealth= int(self.getDeltaWealth() *self.getTimeElapsed())
        self.resources.energy= int(self.getDeltaEnergy() *self.getTimeElapsed())
        self.resources.metals= int(self.getDeltaMetals() *self.getTimeElapsed())
        self.resources.organic=int(self.getDeltaOrganic()   *self.getTimeElapsed())
    
    def getTimeElapsed(self):
        # returns the number of seconds elapsed since last update
    #    print '\n\n',time(),' - ', self.lastUpdate,'\n\n'
        return time() - self.lastUpdate
    
    def getScience(self):
        #returns current amout of science
        self.update()
        return self.resources.science
        
    def getWealth(self):
        #returns current amout of science
        self.update()
        return self.resources.wealth
        
    def getEnergy(self):
        #returns current amout of energy
        self.update()
        return self.resources.energy   
        
    def getMetals(self):
        #returns current amout of metals
        self.update()
        return self.resources.metals         

    def getOrganic(self):
        # alias for getLife()
        return self.getLife()
        
    def getLife(self):
        #returns current amout of life
        self.update()
        return self.resources.organic   