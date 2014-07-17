from py.page_maker.chunks import chunks
from py.page_maker.Settings import Settings
from bottle import template
from py.getAsteroid import byName

CHUNKS = chunks()

def asteroidTrackResponder(asteroidName, user, webSock, OOIs):
    # responds to asteroid track requests by sending html for a tile to be added to the content section
    message = '{"cmd":"addToContent","data":"'
    
    if user.purchase('asteroidTrack'):
        print 'request to track '+asteroidName+' accepted.'

        asteroidData=byName(asteroidName)

        print asteroidData

        print len(asteroidData)

        if asteroidData == None or asteroidData == "" or asteroidData == '[]':
            print 'problem getting '+str(asteroidName)+ ' from asterank'
            message += template('tpl/content/tiles/uhoh',
                text="Sorry, I couldn't add "+str(asteroidName)+". Maybe try again later?",
                chunks=CHUNKS,
                config=Settings('default'),
                title='Something went terribly wrong tracking that asteroid!',
                user=user)
        else:
            OOIs.addObject(asteroidData, user.name)
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
    
def parse(cmd, data, user, websock, OOIs):
    # takes appropriate action on the given command and data string
    if cmd == 'track':
        asteroidTrackResponder(data, user, websock, OOIs)
    elif cmd == 'hello':
        registerUserConnection(user, websock)
    elif cmd == 'research':
        researchResponder(user, websock, data)
    else:
        print "UNKNOWN CLIENT MESSAGE: cmd=",cmd,"data=",data," from user ",user
