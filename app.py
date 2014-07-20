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

#db control
from py.game_logic.user.User import User
import pymongo
import datetime
import ssl
from pymongo import MongoClient

#client = MongoClient('localhost', 27017)
#client=MongoClient('mongodb://rsimulate:r5imulate@ds037637.mongolab.com:37637/cosmosium')
client = MongoClient('mongodb://admin:%40st3r0idVenture5@small.asteroid.ventures:27017')
# Primary Components
import os
import sqlite3 as lite
import sys
import json
import string
import random

import pymongo # import Connection

from bottle import static_file, template, request, Bottle, response, redirect, abort


# OAuth components
import rauth
import config

# websockets:
from geventwebsocket import WebSocketError
from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
import py.webSocketParser as webSocketParser

# Template Components
from py.page_maker.chunks import chunks # global chunks
from py.page_maker.Settings import Settings

# ui handlers:
from py.query_parsers.getUser import getProfile, demoIDs
# game logic:
from py.game_logic.user.User import User
from py.game_logic.GameList import GameList
from py.game_logic.UserList import UserList

from py.getAsteroid import asterankAPI

#=====================================#
#              GLOBALS                #
#=====================================#
app = Bottle()
CHUNKS = chunks()   # static chunks or strings for the site
DOMAIN = 'localhost:7099' # domain name
GAMES = GameList()  # list of ongoing games on server
GAMES.unpickle() # restores any games that were saved last time server shut down

USERS = UserList()  # list of users on the server TODO: replace use of this w/ real db.
MASTER_CONFIG = 'default' # config keyword for non-test pages. (see Config.py for more info)

# initial write of JSON files (to clear out old ones):
GAMES.games[0].OOIs.write2JSON(Settings('default').asteroidDB, Settings('default').ownersDB)

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
def font_static(filename):
    return static_file(filename, root='./fonts/')
    
@app.route('/img/<filename:path>')
def img_static(filename):
    return static_file(filename, root='./img/')
    
@app.route('/db/<filename:path>')
def db_static(filename):
    return static_file(filename, root='./db/')

@app.route('/models/<filename:path>')
def po_static(filename):
    return static_file(filename, root='./models/')

#=====================================#
#           dynamic js files          #
#=====================================#
@app.route("/tpl/js/<filename>")
def getDynamicJS(filename):
    # check for user login token in cookies
    _user = getLoggedInUser(request)
    if _user != None:
    #    try:
        return template('tpl/js/'+filename, user=_user, DOMAIN=DOMAIN)
    #    except:
    #        print 'error getting template "'+str(filename)+'"!'
    #        return 404
    else:
        redirect('/userLogin')

#=====================================#
#      Routing Helper Functions       #
#=====================================#
def getLoggedInUser(request):
    '''
    returns user object if logged in, else returns None
    '''
    if request.get_cookie("cosmosium_login"):
        userLoginToken = request.get_cookie("cosmosium_login")
        try:
            return USERS.getUserByToken(userLoginToken)
        except (KeyError, ReferenceError) as E: # user token not found or user has been garbage-collected
            return None
    else: return None
    
#=====================================#
#         Custom Error Handles        #
#=====================================#
@app.error(404)
def error404(error):
    _user = getLoggedInUser(request)
    if _user != None:
        return template('tpl/pages/404',
                        chunks=CHUNKS,
                        user=_user,
                        config=Settings(MASTER_CONFIG, showBG=False),
                        pageTitle="LOST IN SPACE")
    else:
        redirect('/userLogin')

@app.error(500)
def error500(error):
    print '500 error getting ', request.url, ':', response.body
    return "oops! something broke. we've logged the error. \
        if you want to help us sort it out, please visit \
        <a href='https://github.com/rSimulate/Cosmosium/issues'>our issue tracker on github</a>."


#=====================================#
#            game content             #
#=====================================#
@app.route('/content')
def makeContentHTML():
    name=request.query.name # content page name
    subDir = request.query.section=request.query.section # specific section of page (like type of research page)

    # check for user login token in cookies
    if request.get_cookie("cosmosium_login"):
        userLoginToken = request.get_cookie("cosmosium_login")
        try:
            _user = USERS.getUserByToken(userLoginToken)
        except (KeyError, ReferenceError) as E: # user token not found or user has been garbage-collected
            redirect('/userLogin')

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
                            user=_user,
                            oois=GAMES.games[0].OOIs,
                            config=Settings(MASTER_CONFIG),
                            pageTitle=name)
        else: # else show content under construction
            print 'unknown content request: '+fileName
            return template('tpl/content/under_construction')
    else:
        redirect('/userLogin')

#=====================================#
#           Splash Page               #
#=====================================#
@app.route("/")
def makeSplash():
    return template('tpl/pages/splash', gameList=GAMES, demoIDs=demoIDs)

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
            return userLogin('user token not found')

        if _user.game == None:
            GAMES.joinGame(_user)

        return template('tpl/pages/play',
                        chunks=CHUNKS,
                        user=_user,
                        oois=GAMES.games[0].OOIs,
                        config=Settings(MASTER_CONFIG),
                        pageTitle="Cosmosium Asteriod Ventures!")
    else: return userLogin('user login cookie not found')

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
            mesDict = eval(str(message))
            try:
                gameID = mesDict['gID']
                userID = mesDict['uID']
                cmd    = mesDict['cmd']                    
                data   = mesDict['dat']
            except KeyError:
                print 'malformed message!'

            except TypeError as e:
                if e.message == "'NoneType' object has no attribute '__getitem__'":
                    # it's likely that pesky onclose message I can't fix... ignore for now
                    print 'connection closed'
                else:
                    raise
            # TODO: call message parser sort of like:
            #game_manager.parseMessage(message,wsock)
            # NOTE: message parser should probably be an attribute of the game
            webSocketParser.parse(cmd, data, USERS.getUserByToken(userID), wsock, GAMES.games[0].OOIs)
            print "received :",cmd,'from',userID
        except WebSocketError:
            print 'websocketerror encountered'
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

@app.route('/systemView')
def systemView():
    _user = getLoggedInUser(request)
    if _user != None:
        return template('tpl/systemView',
                        user=_user,
                        chunks=CHUNKS,
                        config=Settings('default',showFrame=False,showResources=False,showBG=False,controlBG=True),
                        pageTitle="system View"
                        )
    else: 
        redirect('/userLogin')
    

@app.route('/viewTest')
def systemView():
    return template('tpl/systemView',
                    user=User(),
                    chunks=CHUNKS,
                    config=Settings('test',showFrame=False,showResources=False,showBG=False,controlBG=True),
                    pageTitle="ViewTest"
        )


@app.route('/getAsteroids')
def getOOIs():
    GAMES.games[0].OOIs.write2JSON(Settings('default').asteroidDB, Settings('default').ownersDB)
    return Settings(MASTER_CONFIG).asteroidDB
    
@app.route('/asteroidReq')
def processReq():
    q = request.query.query
    lim = request.query.limit
    print 'q=',q,' l=',lim
    return template('type: {{datatype}} (response {{res}})', datatype="asterank", res=asterankAPI(q,lim))

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
### https://github.com/mongolab/mongodb-driver-examples/blob/master/py/pymongo_simple_example.py

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
    return template('tpl/pages/userLogin', demoIDs=demoIDs, message=specialMessage)


def createUser(name, icon, agency, subtext ):                       #test user creation...
    # basically a User constructor using a given set of values
    #  to save me some typing
    use = User()
    use.setProfileInfo(name,icon,agency,subtext)
    return use
    


@app.post('/loggin')
def setLoginCookie():
    uid = request.forms.get('userid')
    pw  = request.forms.get('password')
    rem = request.forms.get('remember_me')
    db=client.users

    if str(db.test_user.find_one({"user":uid})) == 'None':

        return "User not Found"
    else:
        if str(db.test_user.find_one({"user":uid},{"password": 1,"_id":0})) == str("{u'password': u'"+pw+"'}"): #matches input password to db password, probably better way to pull out just the password value
            _user = USERS.getUserByName(uid) # TODO: replace this with db lookup
 
            loginToken = uid+"loginToken"+''.join(random.choice(string.ascii_letters + string.digits) for _ in range(5))


            def createUser(name, icon, agency, subtext ):
                use = User()
                use.setProfileInfo(name,icon,agency,subtext)
                return use
            mongo_user=db.test_user.find_one({"user":uid},{"user": 1,"_id":0})['user'] #pull out mongodb query and display only the value of the approriate key, i.e. pymongo returns a <type 'dict'>
            mongo_org=db.test_user.find_one({"user":uid},{"org": 1,"_id":0})['org']
            mongo_quote=db.test_user.find_one({"user":uid},{"quote": 1,"_id":0})['quote']

            userObj=createUser(mongo_user,'/img/profiles/martin2.png',mongo_org,mongo_quote)

            try:
                USERS.addUser(userObj,loginToken)
            except ValueError as e:
                print e.message
            response.set_cookie("cosmosium_login",loginToken,max_age=60*60*5)
            redirect('/play')



        else:
            return "Wrong Password"


@app.post('/signup')
def setLoginCookie():
    uid = request.forms.get('userid')
    pw  = request.forms.get('password')
    rpw = request.forms.get('repeat_password')
    org = request.forms.get('org')
    quote = request.forms.get('quote')

    db=client.users                                       #define which database to use

    if str(db.test_user.find_one({"user":uid})) == 'None':  #check that user does not exist in db



        if pw == rpw:                                       #check that passwords match

            data={"user":uid,                               #make new user document
            "password":pw,
            "org":org,
            "quote":quote,
            "date":datetime.datetime.utcnow()}
            db.test_user.insert(data)                       #insert document into db

            return 'User Added'
        else:

            return 'Passwords do not match'
    else:

        return 'User Name Already Exists'



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
    try:
     #   app.catchall = True  # Now most exceptions are re-raised within bottle.
        port = int(os.environ.get("PORT", 7099))
        #run(host='0.0.0.0', port=port)
        server = WSGIServer(("0.0.0.0", port), app,
                            handler_class=WebSocketHandler)
        print 'starting server on '+str(port)
        server.serve_forever()
        print 'code after this point never executes.'
        main(sys.argv[1:])  # Invokes Mongo
    finally:
        print 'shutting down...'
        # do all your destructing here, the server is going down.
