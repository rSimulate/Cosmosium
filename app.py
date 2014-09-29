#!/usr/bin/env python

# =====================================#
# COSMOSIUM              #
#=====================================#
#       SpaceAppChallenge 2014        #
#                                     #
#              Tom Riecken            #
#             Tylar Murray            #
#             Brian Erikson           #
#             Martin Kronberg         #
#             Daniel Andersen         #
#               Max Howeth            #
#             David Gundry            #
#                                     #
#=====================================#
__author__ = 'rsimulate'

#=====================================#
#         Library Imports             #
#=====================================#

#db control

# Primary Components
import os
import sqlite3 as lite
import sys
import string
import random

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
from py.page_maker.chunks import chunks  # global chunks
from py.page_maker.Settings import Settings

# ui handlers:
from py.query_parsers.getUser import getProfile, demoIDs

# game logic:
from py.game_logic.user.User import User
from py.game_logic.GameList import GameList
from py.game_logic.UserList import UserList


#=====================================#
#              GLOBALS                #
#=====================================#
app = Bottle()
CHUNKS = chunks()  # static chunks or strings for the site
DOMAIN = config.DOMAIN  # domain name
GAMES = GameList()  # list of ongoing games on server
GAMES.unpickle()  # restores any games that were saved last time server shut down

USERS = UserList()  # list of users on the server TODO: replace use of this w/ real db.
MASTER_CONFIG = 'default'  # config keyword for non-test pages. (see Config.py for more info)
loginTokens = []

# initial write of JSON files (to clear out old ones):
# GAMES.games[0].OOIs.write2JSON(Settings('default').asteroidDB, Settings('default').ownersDB)


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
    _user = get_user(request)
    if _user != None:
        #    try:
        return template('tpl/js/' + filename, user=_user, DOMAIN=DOMAIN)
    #    except:
    #        print 'error getting template "'+str(filename)+'"!'
    #        return 404
    else:
        redirect('/userLogin')


#=====================================#
#      Routing Helper Functions       #
#=====================================#
def get_user(req):
    """
    :param user_name: user name passed via query string (used only for test cases to circumnavigate login cookies)
    :returns: user object if logged in, else redirects to login page
    """
    if req.get_cookie("cosmosium_login"):
        user_login_token = req.get_cookie("cosmosium_login")
        try:
            return USERS.getUserByToken(user_login_token)
        except (KeyError, ReferenceError) as E:  # user token not found or user has been garbage-collected
            pass

    # if user was not found
    if req.query.user == 'admin':  # check for test users
        user = USERS.getUserByName("admin_test_user")
        set_login_cookie(user, "admin_test_user", None, None)
        return user

    # if not a normal user and not a test user
    else:
        redirect('/userLogin')


#=====================================#
#         Custom Error Handles        #
#=====================================#
@app.error(404)
def error404(error):
    print error
    return template('tpl/pages/404',
                    chunks=CHUNKS,
                    user=get_user(request),
                    config=Settings(MASTER_CONFIG, showBG=False),
                    pageTitle="LOST IN SPACE")


@app.error(500)
def error500(error):
    print error
    print '500 error getting ', request.url, ':', response.body
    return "oops! something broke. we've logged the error. \
        if you want to help us sort it out, please visit \
        <a href='https://github.com/rSimulate/Cosmosium/issues'>our issue tracker on github</a>."


#=====================================#
#           Splash Page               #
#=====================================#
@app.route("/")
def make_splash():
    return template('tpl/pages/splash', gameList=GAMES, demoIDs=demoIDs)


#=====================================#
#       main gameplay page            #
#=====================================#
@app.route("/play")
@app.route("/play/")
def make_game_page():
    _user = get_user(request)

    _user.disconnected = False
    if _user.game is None:
        GAMES.joinGame(_user)

    return template('tpl/pages/play',
                    chunks=CHUNKS,
                    user=_user,
                    oois=GAMES.games[0].OOIs,
                    config=Settings(MASTER_CONFIG),
                    pageTitle="Asteroid Ventures!")


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
                cmd = mesDict['cmd']
                data = mesDict['dat']
            except KeyError:
                print 'malformed message!'

            except TypeError as e:
                if e.message == "'NoneType' object has no attribute '__getitem__'":
                    if userID is not None:
                        USERS.getUserByToken(userID).disconnected = True
                else:
                    raise
            # TODO: call message parser sort of like:
            #game_manager.parseMessage(message,wsock)
            # NOTE: message parser should probably be an attribute of the game
            user = USERS.getUserByToken(userID)
            if not user.disconnected:
                print "received :", cmd, 'from', userID
                webSocketParser.parse(cmd, data, user, wsock, USERS, GAMES.games[0].OOIs)
        except WebSocketError:
            print 'client disconnected'
            break


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
        'parts_enabled': 'Hydrazine Engine',
        'research_level': 1,
        'sci_pts_cost': 10,
    },
    {
        'technology': 'Ionized Propulsion',
        'tech_type': 'Propulsion',
        'parts_enabled': 'Xenon Thruster',
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
    client = "tmp"


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


def createUser(name, icon, agency, subtext):  #test user creation...
    # basically a User constructor using a given set of values
    #  to save me some typing
    use = User()
    name = name.replace(' ', '_')
    use.setProfileInfo(name, icon, agency, subtext)
    return use


def createToken(name):
    return name + "token" + ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(10))


@app.post('/loggin')
def submit_log_in():
    uid = request.forms.get('userid')
    pw = request.forms.get('password')
    rem = request.forms.get('remember_me')
    _user = USERS.getUserByName(uid)
    set_login_cookie(_user, uid, pw, rem)


def set_login_cookie(_user, uid, pw, rem):
    if _user:  # if user has existing login (in python memory)
        if uid in demoIDs or False:  # TODO: replace this false with password check
            loginToken = uid + "loginToken" + ''.join(
                random.choice(string.ascii_letters + string.digits) for _ in range(5))
            userObj = getProfile(uid)
            try:
                USERS.addUser(userObj, loginToken)
            except ValueError as e:
                print e.message

            response.set_cookie("cosmosium_login", loginToken, max_age=60 * 60 * 5)
            redirect('/play')
    elif False:  # if user is in database
        # TODO: load user into USERS (python memory)
        pass
    else:
        return userLogin('user not found')


@app.post('/signup')
def setLoginCookie():
    uid = request.forms.get('userid')
    pw = request.forms.get('password')
    rpw = request.forms.get('repeat_password')
    org = request.forms.get('org')
    quote = request.forms.get('quote')


# Successful login
@app.post('/success')
def login_success():
    token = request.forms.get('token')
    session = rauth.OAuth2Session(config.GOOGLE_CLIENT_ID, config.GOOGLE_CLIENT_SECRET, token)
    json = session.get('https://www.googleapis.com/oauth2/v1/userinfo').json()
    if json is None:
        return

    def convert(input):
        if isinstance(input, dict):
            return {convert(key): convert(value) for key, value in input.iteritems()}
        elif isinstance(input, list):
            return [convert(element) for element in input]
        elif isinstance(input, unicode):
            return input.encode('utf-8')
        else:
            return input

    json = convert(json)
    user = createUser(json['name'], json['picture'], "NASA", "For the Benefit of All")
    gameToken = createToken(user.name)
    USERS.addUser(user, gameToken)
    response.set_cookie("cosmosium_login", gameToken, max_age=60 * 60 * 5)
    loginTokens.append({'name': user.name, 'social_token': token, 'game_token': gameToken})
    redirect('/play')

@app.route('/signout')
def signout():
    token = request.get_cookie('cosmosium_login')
    user = USERS.getUserByToken(token)
    user.sendMessage('{"cmd":"notify","data":signout"}')
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
        port = int(os.environ.get("PORT", config.PORT))
        #run(host='0.0.0.0', port=port)
        server = WSGIServer(("0.0.0.0", port), app,
                            handler_class=WebSocketHandler)
        print 'starting server on ' + str(port)
        server.serve_forever()
        print 'code after this point never executes.'
        main(sys.argv[1:])  # Invokes Mongo
    finally:
        print 'shutting down...'
        # do all your destructing here, the server is going down.