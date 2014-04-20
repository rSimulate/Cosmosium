# system settings file for sysadmin and debugger use

class Settings(object):
    def __init__(self,configName='default', **kwargs):
        # always start from default setup:
        self.ownersDB    = 'db/owners.js'
        self.asteroidDB = 'db/OOIs.js'
        self.showFrame = True
        self.showBG    = True
        self.showResources = True
        self.controlBG = False
    
        # use general config setup key to specify settings preset:
        if configName == "default":
            pass # already set up
        elif configName == "test":
            self.testSetup()
        else:
            raise ValueError('unknown settings configName "'+str(configName)+'"')
            
        # set custom-specified settings:
        for kw in kwargs.keys():
            if eval('self.'+kw+'!=None'):
                exec('self.'+kw+'='+str(kwargs[kw]))
        
        
    def testSetup(self):
        self.ownersDB    = 'db/test_owners.js'
        self.asteroidDB = 'db/test_asteroids.js'