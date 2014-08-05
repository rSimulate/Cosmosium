__author__ = '7yl4r'

"""
all things needed to start tracking an asteroid.
"""

from ast import literal_eval

RESPONSE_SUCCESS = "accepted"
RESPONSE_MISSING_GAME = "Cannot_find_game_instance_for_player"
RESPONSE_UNDERFUNDED = "denied_for_lack_of_funds"


def asteroid_track_request_responder(data, user):
    # responds to asteroid track requests by sending html for a tile to be added to the content section
    message = '{"cmd":"claim","data":"'
    asteroid = literal_eval(data)
    if user.purchase('asteroidTrack'):
        print 'request to track', asteroid['orbitName'], 'by player', str(user.name), 'accepted.'

        if user.game is not None:
            user.game.changeAsteroidOwner(str(user.name), asteroid['objectId'], user)
            result = RESPONSE_SUCCESS
        else:
            result = RESPONSE_MISSING_GAME
    else:
        result = RESPONSE_UNDERFUNDED

    message += "{'result': "+result+", 'owner': "+str(user.name)+", objectId: "+asteroid['objectId']+"}"
    message += '"}'
    user.sendMessage(message)
    return result