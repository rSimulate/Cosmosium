from py.page_maker.chunks import chunks
from py.page_maker.Settings import Settings
from bottle import template
from py.getAsteroid import byName
from ast import literal_eval

CHUNKS = chunks()

def asteroidTrackResponder(data, user):
    # responds to asteroid track requests by sending html for a tile to be added to the content section
    message = '{"cmd":"claim","data":"'
    asteroid = literal_eval(data)
    if user.purchase('asteroidTrack'):
        print 'request to track', asteroid['orbitName'], 'by player', str(user.name), 'accepted.'

        if user.game is not None:
            user.game.changeAsteroidOwner(asteroid['owner'], asteroid['objectId'], user)
            result = "accepted"
        else:
            result = "Cannot_find_game_instance_for_player"
    else:
        result = "denied_for_lack_of_funds"

    message += "{'result': "+result+", 'owner': "+str(user.name)+", objectId: "+asteroid['objectId']+"}"
    message += '"}'
    if user.websocket is not None:
        user.websocket.send(message)
    else:
        print "ERROR: Cannot send asteroid track response to player", str(user.name)+". Client websocket does not exist"
    
def registerUserConnection(user,ws):
    # saves user websocket connetion so that updates to the user object can push to the client
    user.websocket = ws
    
def researchResponder(user, ws, researchType):
    message = '{"cmd":"addToContent","data":"'
    
    if user.purchase('research_'+researchType):
        user.research.advance()
        message+= template('tpl/content/tiles/purchase_success',
            chunks=CHUNKS,
            config=Settings('default'),
            pageTitle='research complete',
            user=user)
    else:
        message+= template('tpl/content/tiles/insufficientFunds',
            chunks=CHUNKS,
            config=Settings('default'),
            pageTitle='research denied',
            user=user)
    message+='"}'
    ws.send(message)

def playerObjectResponder(user, ws, data):
    """

    :param user: the requesting user
    :param ws:
    :param data: data as a string
    :return:
    """
    game = user.game
    if game is not None:
        # Data Example
        # {'data': {'cmd': 'create', 'orbit': {'a': 1.00000261, 'om': 0, 'e': 0.01671123, 'i': 1.531e-05,
        # 'L': 100.46457166, 'P': 365.256, 'epoch': 2451545, 'w': 102.93768193, 'w_bar': 102.93768193,
        # 'ma': -2.47311027}}, 'model': 'magellan', 'cmd': 'pObjCreate', 'type': 'probe', 'objectId': None}
        data = literal_eval(data)

        pData = data['data']
        cmdName = pData['cmd']
        if cmdName == 'create':
            # TODO: Check and see if there's enough resources to grant the request
            objectType = pData['type']
            model = pData['model']
            orbit = pData['orbit']

            message = '{"cmd":"pObjCreate","data":"'
            message += str(game.addPlayerObject(objectType, model, orbit, user.name))
            message += '"}'

            ws.send(message)

        elif cmdName == 'query':
            uuid = pData['uuid']

            message = '{"cmd":"pObjRequest","data":"'
            message += str(game.getPlayerObject(uuid))
            message += '"}'

            ws.send(message)

        elif cmdName == 'destroy':
            uuid = pData['uuid']
            result = game.removePlayerObject(uuid, user.name)

            # TODO: provide an actual reason for failing to remove an object
            # TODO: Send back success along with possible recovered res from destroyed object
            if result:
                obj = {'result': str(result), 'objectId': uuid, 'reason': str(result)}
                print "syncronizing clients for removal of object", uuid
                game.synchronizeObjectRemoval(obj)
            else:
                obj = {'result': str(result), 'objectId': uuid, 'reason': str(result)}
                message = '{"cmd":"pObjDestroyRequest","data":"'
                message += str(obj)
                message += '"}'
                ws.send(message)

def surveyResponder(data, user, websock):
    # {'survey': 'MainBelt', 'amt': 0}
    # Amt of 0 == all asteroids in survey
    surveyData = literal_eval(data)
    if surveyData['survey'] == 'NEO':
        user.game.synchronizeSurvey(user, 'NEO', int(surveyData['amt']))

    elif surveyData['survey'] == 'MainBelt':
        user.game.synchronizeSurvey(user, 'MainBelt', int(surveyData['amt']))

    elif surveyData['survey'] == 'KuiperBelt':
        user.game.synchronizeSurvey(user, 'KuiperBelt', int(surveyData['amt']))

    elif surveyData['survey'] == 'SolarSystem':
        user.game.synchronizeSurvey(user, 'SolarSystem', int(surveyData['amt']))

    else:
        print "ERROR: Player", user.name, "requested an unknown asteroid survey"

def refreshResponder(user):
    user.game.synchronizeObjects(user)
    
def parse(cmd, data, user, websock, OOIs=None, GAMES=None):
    # takes appropriate action on the given command and data string
    if cmd == 'claim':
        asteroidTrackResponder(data, user)
    elif cmd == 'getSurvey':
        surveyResponder(data, user, websock)
    # TODO: Send asteroid limit for user on hello
    elif cmd == 'hello':
        registerUserConnection(user, websock)
    elif cmd == 'refresh':
        refreshResponder(user)
    elif cmd == 'research':
        researchResponder(user, websock, data)
    elif cmd == 'playerObject':
        playerObjectResponder(user, websock, data)
    else:
        print "UNKNOWN CLIENT MESSAGE: cmd=",cmd,"data=",data," from user ",user
