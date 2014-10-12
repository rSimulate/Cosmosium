from py.game_logic.user.User import User

demoIDs = ['Johannes_Kepler','Edwin_Hubble','Yuri_Gagarin','Carl_Sagan','Jebediah_Kerman','Chris_Hadfield','admin_test_user']

def createUser(name, icon, agency, subtext ):
    # basically a User constructor using a given set of values
    #  to save me some typing
    use = User()
    use.setProfileInfo(name,icon,agency,subtext)
    return use
    

def getDemoProfile(userName):
    # returns User() object with data for given user name if exists,
    #  else returns false
    # NOTE: this should later be replaced with a database lookup
    if userName == 'Johannes_Kepler':
        return createUser('Johannes_Kepler','/img/profiles/kepler.jpg','17th century Germany', 'Exploring the Mysterium Cosmographicum')
    elif userName =='Edwin_Hubble':
        return createUser('Edwin_Hubble','/img/profiles/hubble.png','Mount Wilson Observatory','Equipped with his five senses, man explores the universe around him and calls the adventure Science')
    elif userName =='Yuri_Gagarin':
        return createUser('Yuri_Gagarin','/img/profiles/yuri-gagarin.jpg','Soviet Air Forces','The main force in man is the power of the spirit.')
    elif userName =='Carl_Sagan':
        return createUser('Carl_Sagan','/img/profiles/Carl_Sagan.png','Laboratory for Planetary Studies','Science is much more than a body of knowledge. It is a way of thinking.') 
    elif userName =='Jebediah_Kerman':
        return createUser('Jebediah_Kerman','/img/profiles/jeb.png','Kerbal Space Program','MOAR BOOSTERS!!!')
    elif userName =='Chris_Hadfield':
        return createUser('Chris_Hadfield','/img/profiles/hadfield.jpg','Canadian Space Agency','every single decision you make turns you a little bit into the person you want to be tomorrow') 
    elif userName =='admin_test_user':
        return createUser('admin_test_user','/img/profiles/martin2.png','Boulder, yo','I wish I knew python better...')



    else :
        raise ValueError('user "'+userName+'" not found')
    

# DEPRECIATED!!!
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
            
    else: # user not in game, must create new and add to game
        print 'Adding new user "'+uName+'" to game '+str(currentGame)
        user = getProfile(uName) # retrieve & build profile
        gameList.findOpenSlot(user) # add user to a game
        return user
    
    
