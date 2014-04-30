#!/usr/bin/env python

#=====================================#
#              COSMOSIUM              #
#=====================================#
#       SpaceAppChallenge 2014        #
#                                     #
#           Daniel Andersen           #
#              Tom Riecken            #
#             Tylar Murray            #
#           Britton Broderick         #
#               Max Howeth            #
#             David Gundry            #
#                                     #
#=====================================#
__author__ = 'rsimulate'

#=====================================#
#         Library Imports             #
#=====================================#

# Primary Components
import os
from python.bottle import route, run, static_file, template, view, post, request, error, Bottle, response, redirect
import sqlite3 as lite
import sys
import json
import pymongo # import Connection
import string 
import random 

# OAuth components
import rauth
import config

# websockets:
import gevent
from geventwebsocket import WebSocketServer, WebSocketApplication, Resource, WebSocketError
from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
import python.webSocketParser as webSocketParser

# Template Components
from python.page_maker.chunks import chunks # global chunks
from python.page_maker.Settings import Settings

# ui handlers:
from python.query_parsers.getUser import getUser, getProfile, demoIDs
from python.query_parsers.checkQuery import checkQuery

# game logic:
from python.game_logic.User import User
from python.OOIs import OOIs
from python.game_logic import purchases
from python.game_logic.GameList import GameList
from python.game_logic.UserList import UserList

from python.getAsteroid import asterankAPI, byName

#=====================================#
#              GLOBALS                #
#=====================================#
app = Bottle()
CHUNKS = chunks()   # static chunks or strings for the site
DOMAIN = 'localhost:7099' # domain name
GAMES = GameList()  # list of ongoing games on server
USERS = UserList()  # list of users on the server TODO: replace use of this w/ real db.
MASTER_CONFIG = 'default' # config keyword for non-test pages. (see Config.py for more info)

OOIs = OOIs() #TODO: this is in the Game() object now... which is now in GameList()
USER = User() #TODO: this should now be replaced with USERS.getByToken() using a token from request cookie

# initial write of JSON files:
OOIs.write2JSON(Settings('default').asteroidDB, Settings('default').ownersDB)

#=====================================#
#            Static Routing           #
#=====================================#
@app.route('/css/<filename:path>')
def css_static(filename):
    return static_file(filename, root='./css/')

@app.route('/js/<filename:path>')
def js_static(filename):
    return static_file(filename, root='./js/')
    
@app.route('/fonts/<filename:path>')
def js_static(filename):
    return static_file(filename, root='./fonts/')
    
@app.route('/img/<filename:path>')
def js_static(filename):
    return static_file(filename, root='./img/')
    
@app.route('/db/<filename:path>')
def js_static(filename):
    return static_file(filename, root='./db/')
 
#=====================================#
#            game content             #
#=====================================#
@app.route('/content')
def makeContentHTML():
    name=request.query.name # content page name
    subDir = request.query.section=request.query.section # specific section of page (like type of research page)
    
    treeimg=''
    if name == 'research': # then get research subDir info
        if subDir=='spaceIndustry':
            treeimg="img/space_industry_tech_tree_images.svg";
        elif subDir=='humanHabitation':
            treeimg="img/space_industry_tech_tree.svg";
        elif subDir=='roboticsAndAI':
            treeimg="img/space_industry_tech_tree_images.svg";
        else:
            return template('tpl/content/404') # error404('404')
    
    fileName='tpl/content/'+name
    if os.path.isfile(fileName+'.tpl'): #if file exists, use it
        return template(fileName,
            tree_src=treeimg, #used only for research pages
            chunks=CHUNKS,
            user=USER,
            oois=OOIs,
            config=Settings(MASTER_CONFIG),
            pageTitle=name)
    else: # else show content under construction
        print 'unknown content request: '+fileName
        return template('tpl/content/under_construction')

#=====================================#
#           Splash Page               #
#=====================================#
@app.route("/")
def makeSplash():
    return template('tpl/pages/splash', gameList=GAMES)
    
#=====================================#
#       main gameplay page            #
#=====================================#
@app.route("/play")
def makeGamePage():
    # check for user login token in cookies
    if request.get_cookie("cosmosium_login"):
        userLoginToken = request.get_cookie("cosmosium_login")
        try:
            _user = USERS.getUserByToken(userLoginToken)
        except (KeyError, ReferenceError) as E: # user token not found or user has been garbage-collected
            return userLogin()
        return template('tpl/pages/play',
            chunks=CHUNKS,
            user=_user,
            oois=OOIs,
            config=Settings(MASTER_CONFIG),
            pageTitle="Cosmosium Asteriod Ventures!")
    else: return userLogin()
            
#=====================================#
#           js                        #
#=====================================#
@app.route("/resourceUpdate.js")
def makeResourceUpdater():
    return template('tpl/js/resourceUpdate', user=USER)
    
@app.route("/webSocketSetup.js")
def makeSocketSetup():
    return template('tpl/js/webSocketSetup', client_id='0', DOMAIN=DOMAIN)

# NOTE: this next approach is better than using the real file... but not working currently.
#@app.route("/js/game_frame_nav.js")
#def makeFrameNav():
    # content_files = [fname.split('.')[0] for fname in os.listdir('tpl/content/')] # the files w/o links cause issue here...
#    linked_content_files = ['dash','systemView','missionControl','launchpad','observatories','timeline','neos','mainBelt','kuiperBelt','spaceIndustry','humanHabitation','roboticsAndAI','launchSys','resMarket','fuelNet','spaceTourism','outreach','gov','org']
#    return template('tpl/js/game_frame_nav', 
#        contentFiles=linked_content_files)

#=====================================#
#          web sockets                #
#=====================================#
@app.route('/websocket')
def handle_websocket():
    wsock = request.environ.get('wsgi.websocket')
    if not wsock:
        abort(400, 'Expected WebSocket request.')

    while True:
        try:
            message = wsock.receive()
            print "received : "+str(message)
            try:
                mesDict = eval(str(message))
            except TypeError as e:
                if e.message == "'NoneType' object has no attribte '__getitem__'":
                    # it's likely that pesky onclose message I can't fix... ignore for now
                    print 'connection closed'
                else:
                    raise
            try:
                gameID = mesDict['gID']
                userID = mesDict['uID']
                cmd    = mesDict['cmd']                    
                data   = mesDict['dat']
            except KeyError:
                print 'malformed message!'
            # TODO: call message parser sort of like:
            #game_manager.parseMessage(message,wsock)
            # NOTE: message parser should probably be an attribute of the game
            webSocketParser.parse(cmd, data, USERS.getUserByToken(userID), wsock, OOIs)
            
        except WebSocketError:
            break
            

#=====================================#
#        Asteroid Views Routing       #
#=====================================#
@app.route('/searchtest')
def searchTest():
    return template('tpl/searchView',asteroidDB="db/test_asteroids.js")
    
@app.route('/searchNEOs')
def searchNEOs():
    return template('tpl/searchView',asteroidDB="db/NEOs.js")
    
@app.route('/searchMainBelt')
def searchMains():
    return template('tpl/searchView',asteroidDB="db/MainBelt.js")
    
@app.route('/searchKuiperBelt')
def searchKuipers():
    return template('tpl/searchView',asteroidDB="db/KuiperBelt.js")

# these is here to circumvent global variable issues
@app.route('/systemView')
def systemView():
    return template('tpl/systemView',
        user=USER,
        chunks=CHUNKS,
        config=Settings('default',showFrame=False,showResources=False,showBG=False,controlBG=True),   # this is teporarily set to test so it looks nice.
        pageTitle="system View"
        )

@app.route('/viewTest')
def systemView():
    return template('tpl/systemView',
        user=USER,
        chunks=CHUNKS,
        config=Settings('test',showFrame=False,showResources=False,showBG=False,controlBG=True),
        pageTitle="ViewTest"
        )

@app.route('/sysView')
def sysView():
    OOIs.write2JSON(OOI_JSON_FILE,OWNERS_JSON_FILE)
    return template('tpl/sysView',
            config=Settings('test',showFrame=True,showResources=True,showBG=False,controlBG=True),
            chunks=CHUNKS,
            user=USER,
            pageTitle="Solar System")

@app.route('/getAsteroids')
def getOOIs():
    OOIs.write2JSON(OOI_JSON_FILE)
#    with open(OOI_JSON_FILE,'w') as f:
#        json.dump(OOIs.MPOs,f)
#    data = json.dumps(OOIs.MPOs)
#    if len(data) > 2: # if not empty
#        data = data[2:-2] # remove the weird encapsulation of the string
#        data = repr(data)
   #     data = tuple(data,)
   #     print '==datacheck1== \n',data
   # print 'datacheck2\n',data
    # data.decode("string-escape")
    # json=data.replace(r"\"",r")
#    return template('tpl/jsAsteroids',json=data)
    return Settings(MASTER_CONFIG).asteroidDB
    
@app.route('/asteroidReq')
def processReq():
    q = request.query.query
    lim = request.query.limit
    print 'q=',q,' l=',lim
    return template('type: {{datatype}} (response {{res}})', datatype="asterank", res=asterankAPI(q,lim))

#=====================================#
#           User Actions              #
#=====================================#
@app.route('/content/addAsteroid')
def addOOI():
    name = str(request.query.name)
        
    if USER.affords(purchases.getCost('asteroidTrack')):
        print 'request to track '+name+' accepted.'
        USER.payFor(purchases.getCost('asteroidTrack'))
        OOIs.addObject(byName(name), 'PLAYER_1')
        # write the new js file(s)
        OOIs.write2JSON(Settings('default').asteroidDB,Settings('default').ownersDB)
        print 'object '+name+' added to OOIs'
        return template('tpl/content/asteroidAdd',
            objectName=name,
            chunks=CHUNKS,
            config=Settings(MASTER_CONFIG),
            pageTitle='Asteroid Add Request Approved',
            user=USER)
    else:
        print 'request to track '+name+' denied. insufficient funds.'
        return template('tpl/content/insufficientFunds',
            objectName=name,
            chunks=CHUNKS,
            config=Settings(MASTER_CONFIG),
            pageTitle='Asteroid Add Request Denied',
            user=USER)
            
# DEPRECIATED!!!
@app.route('/addAsteroid')
def addOOI():
    name = str(request.query.name)
        
    if USER.affords(purchases.getCost('asteroidTrack')):
        print 'request to track '+name+' accepted'
        USER.payFor(purchases.getCost('asteroidTrack'))
        OOIs.addObject(byName(name), 'PLAYER_1')
        # write the new js file(s)
        OOIs.write2JSON(Settings('default').asteroidDB,Settings('default').ownersDB)
        print 'object '+name+' added to OOIs'
        return template('tpl/pages/asteroidAdd',
            objectName=name,
            chunks=CHUNKS,
            config=Settings(MASTER_CONFIG),
            pageTitle='Asteroid Add Request Approved',
            user=USER)
    else:
        print 'request to track '+name+' denied. insufficient funds.'
        return template('tpl/pages/insufficientFunds',
            objectName=name,
            chunks=CHUNKS,
            config=Settings(MASTER_CONFIG),
            pageTitle='Asteroid Add Request Denied',
            user=USER)

# @app.route('/upgradeTech')
# def upgradeTech():
    # type = request.query.type
    # cost = purchases.getCost(type,user)
    # if user.affords(purchases.techUpgrade, type):
        # user.upgrade(purchases.techUpgrade, type)
        # return #???

#=====================================#
#      SQLite for Basic UI Data       #
#=====================================#
# SQLite test
@app.route('/data')
def database():
    con = lite.connect('test.db')
    with con:
        cur = con.cursor()
        cur.execute('SELECT SQLITE_VERSION()')
        data = cur.fetchone()
        return "SQLite version: %s" % data


#=====================================#
#     MONGO DB for State Storage      #
#=====================================#

### Testing Mongo with this Example:
### https://github.com/mongolab/mongodb-driver-examples/blob/master/python/pymongo_simple_example.py

### DEFAULT Mongo Path & Port
### MongoDB starting : pid=1160 port=27017 dbpath=/data/db/
### Change with arguments found here:
### http://docs.mongodb.org/manual/tutorial/manage-mongodb-processes/

SEED_DATA = [
    {
        'technology': 'Hydrazine',
        'tech_type': 'Propulsion',
        'parts_enabled':'Hydrazine Engine',
        'research_level': 1,
        'sci_pts_cost': 10,
    },
    {
        'technology': 'Ionized Propulsion',
        'tech_type': 'Propulsion',
        'parts_enabled':'Xenon Thruster',
        'research_level': 2,
        'sci_pts_cost': 20,
    },
]

### Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname
# db.addUser("spacecaptain", "5P@C3")

MainDB = 'localhost:27020/MainDB'
MONGODB_URI = 'mongodb://carl:sagan@' + MainDB
#connection = Connection()

###############################################################################
# main ?
###############################################################################

def main(args):

    client = pymongo.MongoClient(MONGODB_URI)
    db = client.get_default_database()

    # First we'll add a few songs. Nothing is required to create the songs
    # collection; it is created automatically when we insert.
    techtree = db['TechTree']

    # Note that the insert method can take either an array or a single dict.
    techtree.insert(SEED_DATA)
    query = {'tech_type': 'Propulsion'}
    techtree.update(query, {'$set': {'parts_enabled': 'Rocket Engine'}})

    # Running a query
    techlist = techtree.find({'sci_pts_cost': {'$gte': 10}}).sort('research_level', 1)

    for tech in techlist:
        print ('You can research %s in the %s category, at research level %s for %d science points.' %
               (tech['technology'], tech['tech_type'], tech['research_level'], tech['sci_pts_cost']))


    ### If you wanted to drop this table
    #db.drop_collection('TechTree')

    ### Only close the connection when your app is terminating
    client.close()


#=====================================#
#            OAUTH SECTION            #
#=====================================#
# RAUTH Calls to config.py
oauth2 = rauth.OAuth2Service
google = oauth2(
    client_id=config.GOOGLE_CLIENT_ID,
    client_secret=config.GOOGLE_CLIENT_SECRET,
    name='google',
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    access_token_url='https://accounts.google.com/o/oauth2/token',
    base_url='https://accounts.google.com/o/oauth2/auth',
)
redirect_uri = '{uri}:{port}/success'.format(
    uri=config.GOOGLE_BASE_URI,
    port=config.PORT
)

# Login Routing
@app.route('/userLogin')
def userLogin(specialMessage=''):
    return template('tpl/pages/userLogin')
    
@app.post('/loggin')
def setLoginCookie():
    uid = request.forms.get('userid')
    pw  = request.forms.get('password')
    rem = request.forms.get('remember_me')
    
    _user = USERS.getUserByName(uid) # TODO: replace this with db lookup
    if _user: # if user has existing login
        if uid in demoIDs or False: # TODO: replace this false with password check
            loginToken = uid+"loginToken"+''.join(random.choice(string.ascii_letters + string.digits) for _ in range(5))
            userObj = getProfile(uid)
            try:
                USERS.addUser(userObj,loginToken) 
            except ValueError as e:
                print e.message
            response.set_cookie("cosmosium_login",loginToken,max_age=60*60*5)
            redirect('/play')
    else:
        return userLogin('user not found')
    

# I'm not sure how to use this... =( ~Tylar
@app.route('/login<:re:/?>')
def login():
    params = dict(
        scope='email profile',
        response_type='code',
        redirect_uri=redirect_uri
    )
    url = google.get_authorize_url(**params)
    app.redirect(url)

# Successful login
@app.route('/success<:re:/?>')
def login_success():
    code = app.request.params.get('code')
    session = google.get_auth_session(
        data=dict(
            code=code,
            redirect_uri=redirect_uri,
            grant_type='authorization_code'
        ),
        decoder=json.loads
    )
    json_path = 'https://www.googleapis.com/oauth2/v1/userinfo'
    session_json = session.get(json_path).json()
    return 'Welcome {name}!'.format(**session_json)
    # Unfortunately, there seem to be no reference for complete list of keys,
    # but here are the complete json keys returned by the scope: email profile:
    # * email
    # * family_name
    # * gender
    # * given_name
    # * id
    # * link
    # * locale
    # * name
    # * picture
#app.run(
#    server=config.SERVER,
#    port=config.PORT,
#    host=config.HOST
#)


#=====================================#
#          WEB SERVER START           #
#=====================================#

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7099))
    #run(host='0.0.0.0', port=port)
    server = WSGIServer(("0.0.0.0", port), app,
                        handler_class=WebSocketHandler)
    print 'starting server on '+str(port)
    server.serve_forever()
    main(sys.argv[1:]) # Invokes Mongo

    
    
### ================= DEPRECIATED HACKS BELOW ================= ###
### if you see these still used somewhere, try to remove usage. ### 
### much better alternatives should now be in place.            ###
### =========================================================== ###
        
#=====================================#
#           Dashboard Route           #
#=====================================#
@app.route("/dash")
#@view("main")
def makeDash():
    if checkQuery(request):
        return template('tpl/pages/dash',chunks=CHUNKS,
            user=getUser(request,GAMES),
            oois=OOIs,
            config=Settings(MASTER_CONFIG),
            pageTitle="Main Control Panel")
    else:
        return error404('malformed query')
        
#=====================================#
#           Custom 404                #
#=====================================#
@error(404)
def error404(error):
    return template('tpl/pages/404',chunks=CHUNKS,
        user=USER,
        config=Settings(MASTER_CONFIG,showBG=False),
        pageTitle="LOST IN SPACE")


#=====================================#
#           Mission  Pages            #
#=====================================#
@app.route('/missionControl')
def  missionControl():
		return template('tpl/pages/missionControl',
            config=Settings(MASTER_CONFIG),
            chunks=CHUNKS,
            user=USER,
            pageTitle="Mission Planning & Control Center",
            resources=USER.resources)

@app.route('/launchpad')
def launchPad():
    return template('tpl/pages/launchpad',
        config=Settings(MASTER_CONFIG),
        chunks=CHUNKS,
        user=USER,
        pageTitle="Launch Facilities")

@app.route('/observatories')
def launchPad():
    return template('tpl/pages/observatories',
        config=Settings(MASTER_CONFIG),
        chunks=CHUNKS,
        user=USER,
        pageTitle="Main Observational Astronomy Facilities")

#=====================================#
#           Research Pages            #
#=====================================#
@app.route('/research')
def researchPage():
    subDir = request.query.section
    if subDir=='Space Industry':
        treeimg="img/space_industry_tech_tree_images.svg";

    elif subDir=='Human Habitation':
        treeimg="img/space_industry_tech_tree.svg";

    elif subDir=='Robotics and AI':
        treeimg="img/space_industry_tech_tree_images.svg";

    else:
        return error404('404')

    return template('tpl/pages/research', tree_src=treeimg,
        config=Settings(MASTER_CONFIG),
        chunks=CHUNKS,
        user=USER,
        pageTitle=subDir+" Research")


#=====================================#
#           Econ Page Routes          #
#=====================================#
@app.route('/funding')
def fundingPage():
    return template('tpl/funding',chunks=CHUNKS,
        config=Settings(MASTER_CONFIG),
        user=USER,
        pageTitle="Funding")
