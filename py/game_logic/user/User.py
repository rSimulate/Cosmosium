from py.game_logic.user.Message import Message
from py.game_logic.user.Task import Task
from py.game_logic.user.Note import Note
from bottle import template
from py.game_logic.Research import Research
from py.game_logic.units.Telescope import Telescope
from py.game_logic.units.Miner import Miner
from py.game_logic.eco.Resources import Resources
from py.game_logic.eco import purchases
from py.webSocketMessenger import createMessage

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

        self.asteroidLimit = 100
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
        # item must be a Balance object or similarly structured
        return (item.science.oneTime + self.resources.science())>=0\
            and (item.wealth.oneTime + self.resources.wealth())>=0\
            and (item.energy.oneTime + self.resources.energy())>=0\
            and (item.metals.oneTime + self.resources.metals())>=0\
            and (item.organic.oneTime+ self.resources.organic())>=0
              
    def payFor(self,bal):
        # deducts item cost from resources,
        # returns true if purchase is sucessful 
        # assumes that user can afford item
            
        self.resources.applyBalance(bal)
        
        if self.websocket != None:
            self.websocket.send(createMessage('updateResources',data=template('tpl/page_chunks/resourcebar',user=self)))
            return True
        else:
            print 'no websocket connected to user ',self.name

    def purchase(self,item=None, balance=None):
        '''
        checks if user can afford item 
         and deducts item cost from self.resources 
         and adds the item (or the purchases effects) to the user.
        returns true if purchased, returns false if not.
        Default usage is to use an item name from purchase.py.
        If a Balance object "balance" is given INSTEAD of "item", then it is used directly.
        '''
        if item!= None:
            cost = purchases.getCost(item)
            if self.affords(cost):
                self.payFor(cost)
                # TODO: actually do whatever was purchased
                # self.applyItem(item)
                return True
            else:
                return False
        elif balance!= None:
            if self.affords(balance):
                self.payFor(balance)
                return True
            else:
                return False
        else:
            raise ValueError('item or balance object must be given!')
                
        
    ### RESEARCHING (science) ###
    def getTechImage(self, level=None):
        # returns image file name for given techlevel, else returns for current mine techLevel
        # TODO: check that file exists
        if level==None:
            return 'img/tech/tech'+str(self.research.minerLevel)+'.jpg'
        else:
            return 'img/tech/tech'+str(level)+'.jpg'
            
    def advance(self):
        # advances to next research age...
        self.research.advance()
        if self.websocket != None:
            self.websocket.send(createMessage('updateResources',data=template('tpl/page_chunks/resourcebar',user=self)))
            return True
        else:
            print 'no websocket connected to user ',self.name
            
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
        self.resources.update(self)
    

    
