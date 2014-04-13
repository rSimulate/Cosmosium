
class Resources(object):
    def __init__(self):
        self.science = 1234
        self.wealth = 56
        self.energy = 7
        self.metals = 0
        self.life   = 7
        
class miner(object):
    def __init__(self):
        self.techLevel=0
        self.busy=false
        self.ttc=0 #time to completion
        
class telescope(object):
    def __init__(self):
        self.techLevel=0
        self.busy=false
        self.ttc=0 #time to completion
        
class Research(object):
    def __init__(self):
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
        self.telescopes = list()
        self.miners    = list()
        
    def addTele(self):
        self.telescopes.append(Telescope())
        
    def addMiner(self):
        self.miners.append(Miner())