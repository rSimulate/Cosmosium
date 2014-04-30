# defines a game instance, containing all information that might pass back and forth
# between players of the game.

from python.OOIs import OOIs

class Game(object):
    def __init__(self):
        self.OOIs = OOIs()
        self.players = list()
        
    def addPlayer(self, player):
        # adds a player to the current game
        self.players.append(player)
        
    def inGame(self, uName):
        # returns user obj if user is in game, else returns false
        for user in self.players:
            if user.name == uName:
                return user
        else:
            return False
        