from math import exp

class Resources(object):
    def __init__(self):
        self.science = 1234
        self.wealth = 56
        self.energy = 7
        self.metals = 0
        self.life   = 7
        
    def update(self):
        # computes updated values for all resources
        pass
        
    def getScience(self):
        #returns current amout of science
        self.update()
        return self.science
        
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
        
        self.resources = Resources()
        self.research  = Research()
        self.telescopes = list([Telescope(),Telescope()]) #start w/ 2 telescopes
        self.miners    = [Miner()]  #start w/ 1 miner
        
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
    
    