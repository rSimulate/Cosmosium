# defines a game instance, containing all information that might pass back and forth
# between players of the game.
from time import time
from calendar import month_abbr

from py.OOIs import OOIs
from py.game_logic.mockEventList import getMockEventList

GAME_LEN = 60 # max length of game in minutes
GAME_YEAR_SPAN = 200 # years spanned by a max-len game
START_YEAR = 1969 # starting year of game

class Game(object):
    def __init__(self):
        self.OOIs = OOIs()
        self.players = list()
        self.eventList = getMockEventList()
        self._epoch = int(time()) # real-time game start
        
    def time(self,t=None):
        # returns current in-game time representation as a string 
        # if t is given, in-game time at given time t
        if t == None:
            t = time()
        secsPassed = int(time()-self._epoch) #real-time
        yearsPassed = float(secsPassed)/self.getDeltaYearUpdate() #game-time
        month = int(yearsPassed%1*12)
        year  = int(yearsPassed)+START_YEAR
        return month_abbr[month+1]+' '+str(int(yearsPassed)+START_YEAR)
            
    def getDeltaYearUpdate(self):
        # returns time (in real seconds) between year changes in game-time
        return GAME_LEN*60/GAME_YEAR_SPAN # real-time sec / 1 game_year
        
    def addPlayer(self, player):
        # adds a player to the current game
        self.players.append(player)
        
    def addObject(self,object,ownerName=None):
        # adds object to track to OOIs
        self.OOIs.addObject(object,ownerName)
        
    def inGame(self, uName):
        # returns user obj if user is in game, else returns false
        for user in self.players:
            if user.name == uName:
                return user
        else:
            return False
        