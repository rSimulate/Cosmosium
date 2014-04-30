from python.game_logic.Game import Game

class GameList(object):
    def __init__(self):
        self.games = [Game()]
        
    def addGame(self):
        self.games.append(Game())
        

        
    def joinGame(self,userObj):
        # connects given user object to best game
        # if user already in a game, returns that one
        # else finds open slot
        game = self.__inGame(userObj)
        if game:
            userObj.game = game
        else:
            self.__addToGame(userObj,self.__findOpenSlot(userObj))
            
    def __addToGame(self, uObj,gObj):
        # adds given user to given game and ensures all is properly linked
        gObj.addPlayer(uObj)
        uObj.setGame(gObj)
            
    def __inGame(self,user):
        # returns game obj if user is in a game, else returns false
        for game in self.games:
            if game.inGame(user.name):
                return game
        else:
            return False
            
    def __findOpenSlot(self,user):
        # returns the best game for a new user to join
        # NOTE: just uses 1 game for now...
        selectedGame = self.games[0]
        return selectedGame
            
    # DEPRECIATED
    def findOpenSlot(self,user):
        # returns the best open slot for a new user to join a game
        #  adds the player to the game, and returns that game object
        # NOTE: just uses 1 game for now...
        selectedGame = self.games[0]
        selectedGame.addPlayer(user)
        user.setGame(selectedGame)
        return selectedGame
        
    # DEPRECIATED
    def inGame(self,userName):
        # returns user obj if user is in a game, else returns false
        for game in self.games:
            user = game.inGame(userName)
            if user:
                return user, game
        else:
            return False