from py.page_maker.chunks import chunks
from py.page_maker.Settings import Settings
from bottle import template
from py.getAsteroid import byName
from app import GAMES
from ast import literal_eval

CHUNKS = chunks()

def asteroidTrackResponder(asteroidName, user, webSock, OOIs):
    # responds to asteroid track requests by sending html for a tile to be added to the content section
    message = '{"cmd":"addToContent","data":"'
    
    if user.purchase('asteroidTrack'):
        print 'request to track '+asteroidName+' accepted.'
        
        OOIs.addObject(byName(asteroidName), user.name)
        # write the new js file(s)
        OOIs.write2JSON(Settings('default').asteroidDB,Settings('default').ownersDB)
        print 'object '+asteroidName+' added to OOIs'
        message+= template('tpl/content/tiles/asteroidAdd',
            objectName=asteroidName,
            chunks=CHUNKS,
            config=Settings('default'),
            pageTitle='Asteroid Add Request Approved',
            user=user)
    else:
        print 'request to track '+asteroidName+' denied. insufficient funds.'
        message+= template('tpl/content/tiles/insufficientFunds',
            objectName=asteroidName,
            chunks=CHUNKS,
            config=Settings('default'),
            pageTitle='Asteroid Add Request Denied',
            user=user)
    
    message+='"}'
    webSock.send(message)
    
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
    game = GAMES._inGame(user)
    if game is not None:
        pData = literal_eval(data)  # TODO: Parse data
        cmdName = pData['cmd']

        if cmdName == 'create':
            # TODO: Check and see if there's enough resources to grant the request

            objectType = pData['type']
            model = pData['model']
            orbit = literal_eval(pData['data'])

            message = '{"cmd":"pObjCreate","data":"'
            message += str(game.addPlayerObject(objectType, model, orbit, user))
            message += '"}'
            ws.send(message)

        elif cmdName == 'click':
            uuid = pData['uuid']
            message = '{"cmd":"pObjRequest","data":"'
            message += str(game.getPlayerObject(uuid))
            message += '"}'
            ws.send(message)

        elif cmdName == 'destroy':
            uuid = pData['uuid']
            result = game.removePlayerObject(uuid, user)
            message = '{"cmd":"pObjDestroyRequest","data":"'
            message += str(result)
            message += '"}'
            ws.send(message)
            # TODO: Send back success along with possible recovered res from destroyed object
    
def parse(cmd, data, user, websock, OOIs):
    # takes appropriate action on the given command and data string
    if cmd == 'track':
        asteroidTrackResponder(data, user, websock, OOIs)
    elif cmd == 'hello':
        registerUserConnection(user, websock)
    elif cmd == 'research':
        researchResponder(user, websock, data)
    elif cmd == 'playerObject':
        playerObjectResponder(user, websock, data)
    else:
        print "UNKNOWN CLIENT MESSAGE: cmd=",cmd,"data=",data," from user ",user
