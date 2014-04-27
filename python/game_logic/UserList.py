# this class holds all users currently logged on

from python.game_logic.User import User

class UserList(object):
    def __init__(self):
        self.users = list()
        
    def addUser(self,userObj):
        self.users.append(userObj)
        
    def getUserByName(self,name):
        # returns user obj if found, else returns none
        for user in self.users:
            if user.name == name:
                return user
        else:
            return None