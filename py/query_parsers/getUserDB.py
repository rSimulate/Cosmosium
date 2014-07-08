

from py.game_logic.user.User import User

import pymongo

def createUser(name, icon, agency, subtext ):
    use = User()
    use.setProfileInfo(name,icon,agency,subtext)
    return use


def getProfile(userName):

	return createUser(str(db.test_user.find_one({"user":userName},{"user": 1,"_id":0})),'/img/profiles/martin2.png','MONGO_CORP', 'MONGO_QUOTE')


