from python.game_logic.User import User

def createUser(name, icon, agency, subtext ):
    # basically a User constructor using a given set of values
    #  to save me some typing
    use = User()
    use.setProfileInfo(name,icon,agency,subtext)
    return use
    

def getProfile(userName):
    # returns User() object with data for given user name if exists,
    #  else returns false
    # NOTE: this should later be replaced with a database lookup
    if userName == 'Johannes_Kepler':
        return createUser('Johannes_Kepler','/img/profiles/kepler.jpg','17th century Germany', 'Exploring the Mysterium Cosmographicum')
    elif userName =='Edwin_Hubble':
        return createUser('Edwin_Hubble','/img/profiles/hubble.png','Mount Wilson Observatory','Equipped with his five senses, man explores the universe around him and calls the adventure Science')
    else :
        raise ValueError('user "'+userName+'" not found')
    

        
def getUser(req,gameList):
    # returns User() object (from db or memory) for given request query
    currentGame = int(req.query.gameID)
    uName = req.query.player
    
    if currentGame:
        use = gameList.games[currentGame].inGame(uName)
        if use: # if user was found in the game
            return use
        else:
            raise ValueError('gameID '+str(currentGame)+' contains no user '+uName)

    # check for user already in a game
    user = gameList.inGame(uName)
    if user:
        return user
    else: # user not in game, must create new and add to game
        user = getProfile(uName) # retrieve & build profile
        gameList.findOpenSlot(user) # add user to a game
        return user
    
    
