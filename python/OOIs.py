import pickle
import json

OOI_FILE = 'db/OOIs.pickle'

class OOIs(object):
    # objects of interest list class to handle saving/loading
    def __init__(self):
        self.MPOs = list()
        try: 
            self.readOOIs()
        except IOError:
            print 'WARN: cannot load OOIs'
            
    def __del__(self):
        self.saveOOIs()
        
    def saveOOIs(self):
        print 'saving OOIs...'
        with open(OOI_FILE, 'wb') as f:
            pickle.dump(self.MPOs, f)

    def readOOIs(self):
        print 'loading OOIs...'
        try:
            with open(OOI_FILE, 'rb') as f:
                self.MPOs = pickle.load(f)
        except EOFError:    
            print 'WARN: OOI.pickle is empty! Starting from scratch.'
    def addObject(self,object):
        self.MPOs.append(object)
        print 'MPO added.'
        
    #with open(OOI_JSON_FILE,'r') as f:
    #    OOIs = json.loads(f.read().split('=')[1])

    def write2JSON(self,fName):
        with open(fName,'w') as f:
            if len(self.MPOs) > 1:
                dat = json.dumps(self.MPOs)[2:-2].decode("string-escape")
            else :
                dat = "[]"
            f.write('var TestAsteroids = '+dat+";\n")