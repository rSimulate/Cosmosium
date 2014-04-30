from python.game_logic.Game import Game

class GameList(object):
    def __init__(self):
        self.games = [Game()]
        
    def addGame(self):
        self.games.append(Game())
        
    def findOpenSlot(self,user):
        # returns the best open slot for a new user to join a game
        #  adds the player to the game, and returns that game object
        # NOTE: just uses 1 game for now...
        selectedGame = self.games[0]
        selectedGame.addPlayer(user)
        user.setGame(selectedGame)
        return selectedGame
        
    def inGame(self,userName):
        # returns user obj if user is in a game, else returns false
        for game in self.games:
            user = game.inGame(userName)
            if user:
                return user
        else:
            return False