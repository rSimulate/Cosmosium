# this class holds all users currently logged on

from python.game_logic.User import User
from python.query_parsers.getUser import getProfile, demoIDs

class UserList(object):
    def __init__(self):
        self.users = dict()
        
        self.addDemoUsers()
        
    def addUser(self,userObj,token):
        if token in self.users:
            raise ValueError('user with this token already exists')
        if self.getUserByName(userObj.name) != None:
            # raise ValueError('user with this name already exists')
            user = self.getUserByName(userObj.name)
            print 'new token attached to existing user "'+user.name+'"'
            self.users[token] = user # add another token reference to the object
            
        self.users[token] = userObj
        
    def getUserByName(self,name):
        # returns user obj if found, else returns none
        for token in self.users:
            if self.users[token].name == name:
                return self.users[token]
        else:
            return None
            
    def getUserByToken(self,token):
        # returns user obj if found, else returns none
        try:
            return self.users[token]
        except KeyError as e:
            print '\nuser lookup token not found. bad client access attempt?\n'
            raise e
        
    def addDemoUsers(self):
        for user in demoIDs:
            self.addUser(getProfile(user),user+'temp_token')
        