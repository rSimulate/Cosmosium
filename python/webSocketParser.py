from python.page_maker.chunks import chunks
from python.page_maker.Settings import Settings
from python.game_logic import purchases
from python.bottle import template
from python.getAsteroid import byName

CHUNKS = chunks()

def asteroidTrackResponder(asteroidName, user, webSock, OOIs):
    # responds to asteroid track requests by sending html for a tile to be added to the content section
    message = '{"cmd":"addToContent","data":"'
    
    if user.affords(purchases.getCost('asteroidTrack')):
        print 'request to track '+asteroidName+' accepted.'
        user.payFor(purchases.getCost('asteroidTrack'))
        OOIs.addObject(byName(asteroidName), user.name)
        # write the new js file(s)
        OOIs.write2JSON(Settings('default').asteroidDB,Settings('default').ownersDB)
        print 'object '+asteroidName+' added to OOIs'
        message+= template('tpl/content/asteroidAdd',
            objectName=asteroidName,
            chunks=CHUNKS,
            config=Settings('default'),
            pageTitle='Asteroid Add Request Approved',
            user=user)
    else:
        print 'request to track '+asteroidName+' denied. insufficient funds.'
        message+= template('tpl/content/insufficientFunds',
            objectName=asteroidName,
            chunks=CHUNKS,
            config=Settings('default'),
            pageTitle='Asteroid Add Request Denied',
            user=user)
    
    message+='"}'
    webSock.send(message)
    
def parse(cmd, data, user, websock, OOIs):
    # takes appropriate action on the given command and data string
    if cmd == 'track':
        asteroidTrackResponder(data, user, websock, OOIs)