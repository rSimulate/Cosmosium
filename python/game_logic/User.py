
from python.bottle import template
from python.game_logic.Research import Research
from python.game_logic.Telescope import Telescope
from python.game_logic.Miner import Miner
from python.game_logic.Resources import Resources
from python.page_maker.Message import Message
from python.page_maker.Note import Note
from python.page_maker.Task import Task
from python.game_logic import purchases
from python.webSocketMessenger import createMessage

class User(object):
    def __init__(self, name='No Name'):
        ### USER PROFILE DATA ###
        self.name = name
        self.icon = "img/avatar3.png"
        self.agency = 'Serves No Man'
        self.subtext = 'Renegade Astronomer'
        self.profile_link = '#'
        
        self.messages = [Message(),Message()]
        self.notes = [Note()]
        self.tasks = [Task(),Task(),Task(),Task()]
        
        self.history_text = "Game History"
        self.history_link = "#"
        self.stats_text = "Stats"
        self.stats_link = "#"
        self.thing3_text = "More"
        self.thing3_link = "#"
        
        
        ### USER GAME LOGIC DATA ###
        self.game = None # game instance in which this user is playing
        
        self.resources = Resources()          
        self.research  = Research()
        self.telescopes = list([Telescope(),Telescope()]) #start w/ 2 telescopes
        self.miners    = [Miner()]  #start w/ 1 miner
        
        self.websocket = None # most recent websocket connection for sending out updates
        
    def setGame(self,gam):
        # sets the user's current game and updates values accordingly
        self.game = gam
        
    def setProfileInfo(self,name, icon, agency, subtext):
        # sets profile data which should come from the database upon login
        #  currently excludes messages/notes/tasks as well as game history data
        #  and profile link
        self.name = name
        self.icon = icon
        self.agency = agency
        self.subtext = subtext
        
    def setGameInfo(self,resource,research,tele,mine):
        # sets profile data which comes from the current game instance
        #  currently excludes messages/notes/tasks
        self.resources = resource
        self.research = research
        self.telescopes = tele
        self.miners = mine
        
    def affords(self,item):
        # returns true if can afford given item description
        # itemDesc must be a dict with cost values like that returned by purchases.getCost()
        return item['science'] < self.resources.science()\
            and item['wealth'] < self.resources.wealth()\
            and item['energy'] < self.resources.energy()\
            and item['metals'] < self.resources.metals()\
            and item['organic']< self.resources.organic()

                
    def payFor(self,cost):
        # deducts item cost from resources,
        # returns true if purchase is sucessful 
        # assumes that user can afford item
            
        self.resources.science -= cost['science']
        self.resources.wealth  -= cost['wealth']
        self.resources.energy  -= cost['energy']
        self.resources.metals  -= cost['metals']
        self.resources.organic -= cost['organic']
        
        if self.websocket != None:
            self.websocket.send(createMessage('updateResources',data=template('tpl/resourcebar',user=self)))
        else:
            print 'no websocket connected to user ',self.name
        return True

    ### RESEARCHING (science) ###
    def getTechImage(self, level=None):
        # returns image file name for given techlevel, else returns for current mine techLevel
        # TODO: check that file exists
        if level==None:
            return 'img/tech/tech'+str(self.research.minerLevel)+'.jpg'
        else:
            return 'img/tech/tech'+str(level)+'.jpg'
            
    ### ASTRONOM-IZING ###
    def addTele(self):
        self.telescopes.append(Telescope())
        
    ### MINING ($$$ and metals) ###
        
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

    ### COLONIZING (organic/life) ###
    
    ### MORE ###
    def update(self):
        resources.update(self)
    

    
