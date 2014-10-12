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

# std lib components:
import os
import string
import random

# bottle:
from bottle import static_file, template, request, Bottle, response, redirect, abort

# OAuth components:
import rauth

# web sockets:
import geventwebsocket
from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
import py.webSocketParser as webSocketParser

# Template Components
from py.page_maker.chunks import chunks  # global chunks
from py.page_maker.Settings import Settings

# ui handlers:
from py.query_parsers.DemoUsers import getDemoProfile, demoIDs

# game logic:
from py.game_logic.user.User import User
from py.game_logic.GameList import GameList
from py.game_logic.UserList import UserList

# server setup settings:
import config


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
def get_js_template(filename):
    # check for user login token in cookies
    _user = get_user(request)
    if _user is not None:
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
        except (KeyError, ReferenceError):  # user token not found or user has been garbage-collected
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
    return "Oops! Something must've broke. We've logged the error. \
        If you want to help us sort it out, please visit \
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


#=====================================#
#          web sockets                #
#=====================================#
@app.route('/tests')
def display_test_page():
    _user = get_user(request)

    _user.disconnected = False
    if _user.game is None:
        GAMES.joinGame(_user)

    return template('tests/test_list_site',
                    chunks=CHUNKS,
                    user=_user,
                    oois=GAMES.games[0].OOIs,
                    config=Settings(MASTER_CONFIG),
                    pageTitle="Asteroid Ventures!")


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
            message_dict = eval(str(message))
            try:
                game_id = message_dict['gID']
                user_id = message_dict['uID']
                cmd = message_dict['cmd']
                data = message_dict['dat']
            except KeyError:
                print 'malformed message!'

            except TypeError as e:
                if e.message == "'NoneType' object has no attribute '__getitem__'":
                    if user_id is not None:
                        USERS.getUserByToken(user_id).signOut()
                else:
                    raise

            user = USERS.getUserByToken( user_id)
            print "received :", cmd, 'from',  user_id
            webSocketParser.parse(cmd, data, user, wsock, USERS, GAMES.games[0].OOIs)

        except geventwebsocket.WebSocketError:
            print 'client disconnected'
            break

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
def user_login(special_message=''):
    return template('tpl/pages/userLogin', demoIDs=demoIDs, message=special_message)

@app.post('/loggin')  # Path currently used solely for demoIDs
def submit_log_in():
    uid = request.forms.get('userid')
    pw = request.forms.get('password')
    rem = request.forms.get('remember_me')
    _user = USERS.getUserByName(uid)
    set_login_cookie(_user, uid, pw, rem)
    redirect('/play')

def set_login_cookie(_user, uid, pw, rem):
    if _user:  # if user has existing login (in python memory)
        if uid in demoIDs or False:  # TODO: replace this false with password check
            login_token = uid + ''.join(
                random.choice(string.ascii_letters + string.digits) for _ in range(5))
            user_obj = getDemoProfile(uid)
            try:
                USERS.addUser(user_obj, login_token)
            except ValueError as e:
                print e.message

            response.set_cookie("cosmosium_login", login_token, max_age=60 * 60 * 5)
            # redirect('/play')
    elif False:  # if user is in database
        # TODO: load user into USERS (python memory)
        pass
    else:
        return user_login('user not found')

@app.post('/signup')
def setLoginCookie():  # Depreciated for now
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

    def convert(inputt):
        if isinstance(inputt, dict):
            return {convert(key): convert(value) for key, value in inputt.iteritems()}
        elif isinstance(inputt, list):
            return [convert(element) for element in inputt]
        elif isinstance(inputt, unicode):
            return inputt.encode('utf-8')
        else:
            return input
    json = convert(json)
    name = json['name'].replace(" ", "_")
    user = User(name, json['picture'], "NASA", "For the Benefit of All")
    gameToken = user.name
    gameToken = gameToken.replace(" ", "_")
    USERS.addUser(user, gameToken)
    response.set_cookie("cosmosium_login", gameToken, max_age=60 * 60 * 5)
    loginTokens.append({'name': user.name, 'social_token': token, 'game_token': gameToken})

    # now that we're logged in, send the user where they were trying to go, else to main page
    target = request.query.target or '/play'
    redirect(target)

@app.route('/signout')
def signout():
    token = request.get_cookie('cosmosium_login')
    user = USERS.getUserByToken(token)
    user.signOut()


#=====================================#
#          WEB SERVER START           #
#=====================================#

if __name__ == "__main__":
    try:
        port = int(os.environ.get("PORT", config.PORT))
        server = WSGIServer(("0.0.0.0", port), app,
                            handler_class=WebSocketHandler)
        print 'starting server on ' + str(port)
        server.serve_forever()
    finally:
        print 'shutting down...'
        # do all your destructing here, the server is going down.