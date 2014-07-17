# defines a game instance, containing all information that might pass back and forth
# between players of the game.
from time import time
from calendar import month_abbr
import uuid

from py.OOIs import OOIs
from py.game_logic.mockEventList import getMockEventList

GAME_LEN = 60 # max length of game in minutes
GAME_YEAR_SPAN = 200 # years spanned by a max-len game
START_YEAR = 1969 # starting year of game

class Game(object):
    def __init__(self):
        self.OOIs = OOIs()
        self.players = list()
        self.playerObjects = list()
        self.eventList = getMockEventList()
        self._epoch = int(time())  # real-time game start
        
    def time(self, t=None):
        # returns current in-game time representation as a string 
        # if t is given, in-game time at given time t
        if t is None:
            t = time()
        secsPassed = int(t-self._epoch)  # real-time
        yearsPassed = float(secsPassed)/self.getDeltaYearUpdate()  # game-time
        month = int(yearsPassed%1*12)
        year  = int(yearsPassed)+START_YEAR
        return month_abbr[month+1]+' '+str(year)
            
    def getDeltaYearUpdate(self):
        # returns time (in real seconds) between year changes in game-time
        return GAME_LEN*60/GAME_YEAR_SPAN  # real-time sec / 1 game_year
        
    def addPlayer(self, player):
        print "game instance is adding player " + player.name
        # adds a player to the current game
        player.setGame(self)
        self.players.append(player)
        
    def addObject(self, object, ownerName=None):
        # adds object to track to OOIs
        self.OOIs.addObject(object,ownerName)

    def addPlayerObject(self, objectType, model, orbit, ownerName):
        """
        Adds a player object to the instance
        :return: The object as a dict
        """
        pUuid = uuid.uuid4()
        orbit['full_name'] = str(pUuid)
        obj = {'owner': ownerName, 'objectId': uuid.uuid4(), 'type': objectType, 'model': model, 'orbit': orbit}
        print "added ", obj['model'], " for owner ", obj['owner'], " with objectId ", obj['objectId']
        self.playerObjects.append(obj)
        return obj

    def getPlayerObject(self, uuid):
        """
        gets player object from this instance
        :param uuid: The UUID of the object
        :return: object if found, None if not
        """

        for object in self.playerObjects:
            if object['objectId'] == uuid:
                return object

        return None

    def removePlayerObject(self, objectId, fromUser):
        """
        Removes player object from instance
        :param objectId: The UUID of the object
        :return: False if removal fails, True if object was removed
        """
        rObject = None
        for object in self.playerObjects:
            if (object['objectId'] == objectId) & (object['owner'] == fromUser):
                rObject = object

        if rObject is not None:
            try:
                self.playerObjects.remove(rObject)
            except ValueError:
                return False
            finally:
                return True

        return False

    def inGame(self, uName):
        # returns true if user is in game, else returns false
        print str(self.players)
        for user in self.players:

            if user.name == uName:
                return True
        else:
            return False
        