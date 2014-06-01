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

        self._unlocked=[]  # a list of research tree node names which the player has unlocked
        
    def advance(self):
        # advances to the next age
        self.age+=1

    def unlock(self, nodeName):
        self._unlocked.append(nodeName)

    def isUnlocked(self, nodeName):
        if nodeName in self._unlocked:
            return True
        else:
            return False
