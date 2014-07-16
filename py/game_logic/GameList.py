import pickle

from py.game_logic.Game import Game

GAMES_FILE = 'db/GAMELIST.pickle'

class GameList(object):
    def __init__(self):
        self.games = [Game()]
        
    def __len__(self):
        return len(self.games)
        
    def addGame(self):
        self.games.append(Game())
        
    # this turned out to be more trouble than it was worth:    
    # def pickle(self):
        # ''' 
        # Removes down non-pickleable attributes and saves what it can to file.
        # This should be an uncommon operation, used only to preserve game-states for next time the
        # server comes back up.
        # '''
        # with open(GAMES_FILE, 'wb') as f:
            # pickle.dump(self, f,-1)
            # print str(len(self))+' games-in-progress pickled.'
            
    def unpickle(self):
        try:
            with open(GAMES_FILE, 'rb') as f:
                self = pickle.load(f)
        except (EOFError, IOError):    
            print 'No pickled games-in-progress found. Starting from scratch.'
        
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
            
    def _inGame(self,user):
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