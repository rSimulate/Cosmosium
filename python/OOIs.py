import pickle

OOI_JSON_FILE = 'db/OOIs.js'
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
        with open(OOI_FILE, 'wb') as f:
            pickle.dump(self.MPOs, f)

    def readOOIs(self):
        with open(OOI_FILE, 'rb') as f:
            self.MPOs = pickle.load()
            
    def addObject(self,object):
        self.MPOs.append(object)
        
    #with open(OOI_JSON_FILE,'r') as f:
    #    OOIs = json.loads(f.read().split('=')[1])

    def writeOOIsToJSON(self,fName=OOI_JSON_FILE):
        with open(fName,'w') as f:
            f.write('var OOIs = '+json.dumps(self.MPOs, ensure_ascii=True))