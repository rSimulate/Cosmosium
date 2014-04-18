# system settings file for sysadmin and debugger use

class Settings(object):
    def __init__(self,configName):
        if configName == "default":
            self.defaultSetup()
        elif configName == "test":
            self.testSetup()
        else:
            raise ValueError('unknown settings configName "'+str(configName)+'"')

    def defaultSetup(self):
        self.ownersDB    = 'db/owners.js'
        self.asteroidDB = 'db/OOIs.js'
        
    def testSetup(self):
        self.ownersDB    = 'db/test_owners.js'
        self.asteroidDB = 'db/test_asteroids.js'