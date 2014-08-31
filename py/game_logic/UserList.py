# this class holds all users currently logged on

from py.query_parsers.getUser import getProfile, demoIDs

class UserList(object):
    def __init__(self):
        self.users = dict()
        
        self.addDemoUsers()
        
    def addUser(self,userObj,token):
        '''
        Adds user to userList if user with same name does not already exist.
        If user of same name exists, adds a new token to access that existing user obj.
        Returns True if successful.
        '''
        if token in self.users:
            raise ValueError('user with this token already exists')
        if self.getUserByName(userObj.name) != None:
            # raise ValueError('user with this name already exists')
            user = self.getUserByName(userObj.name)
            print 'new token attached to existing user "'+user.name+'"'
            user.disconnected = False
            self.users[token] = user # add another token reference to the object
            return True
        else:
            userObj.disconnected = False
            self.users[token] = userObj
            print 'new user ',userObj.name,'added'
            return True
        
    def getUserByName(self,name):
        # returns user obj if found, else returns none
        for token in self.users:
            if self.users[token].name == name:
                return self.users[token]
        else:
            return None
            
    def getUserByToken(self,token):
        # returns user obj if found, else raises error
        try:
            use = self.users[token]
            try:
                nam = use.name
            except AttributeError as e:
                raise ReferenceError('\nuser found in memory, but object has been deleted!\n') # I _think_ that's the right error throw...
        except KeyError as e:
            e.message += '\nuser lookup token not found. bad client access attempt?\n'
            raise e
        # if no exceptions thrown...
        return self.users[token]
        
    def addDemoUsers(self):
        for user in demoIDs:
            self.addUser(getProfile(user),user+'temp_token')
        