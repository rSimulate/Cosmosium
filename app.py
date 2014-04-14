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


#=====================================#
#         Library Imports             #
#=====================================#

# Primary Components
import os
from python.bottle import route, run, static_file, template, view, post, request
import sqlite3 as lite
import sys
import json

# OAuth components
import rauth
import config

# Template Components
from python.page_maker.chunks import chunks # global chunks
from python.page_maker.Message import Message
from python.page_maker.Note import Note
from python.page_maker.Task import Task
from python.page_maker.User import User
from python.OOIs import OOIs


#=====================================#
#         Page Templating             #
#=====================================#

# Global Variables as Site Chunks
CHUNKS = chunks()
OOIs = OOIs()
MESSAGES = [Message(),Message()]
NOTES = [Note()]
TASKS = [Task(),Task(),Task(),Task()]
USER = User()
OOI_JSON_FILE = 'db/OOIs.js'
OWNERS_JSON_FILE = 'db/owners.js'

#=====================================#
#            Static Routing           #
#=====================================#

# Static Routing
@route('/<filename:path>')
def assets_static(filename):
    return static_file(filename, root='./')

@route("/")
@view("main")
def hello():
    return template('tpl/main_body',chunks=CHUNKS,
        messages=MESSAGES,message_count=2,
        note_count=1,notes=NOTES,
        task_count=4,tasks=TASKS,
        user=USER,
        resources=USER.resources,
        pageTitle="Main Control Panel")


#=====================================#
#        Asteroid App Routing         #
#=====================================#

# set up external python app routings (controllers):
import python.getAsteroid
import python.search

# these is here to circumvent global variable issues
@route('/systemView')
def systemView():
    # TEMPORARY CHANGE FOR FANCY LOOKS
#    OOIs.write2JSON(OOI_JSON_FILE,OWNERS_JSON_FILE)
#    return template('tpl/systemView',
#        asteroidDB=OOI_JSON_FILE,
#        ownersDB=OWNERS_JSON_FILE)
    return template('tpl/systemView',
        asteroidDB='db/test_asteroids.js',
        ownersDB='db/test_owners.js',
        pageTitle="ViewTest"
        )
  
@route('/missionControl')
def  missionControl():
		return template('tpl/missionControl.tpl',
            chunks=CHUNKS,
            messages=MESSAGES,message_count=2,
            note_count=1,notes=NOTES,
            task_count=4,tasks=TASKS,
            user=USER,
            pageTitle="Solar System",
            resources=USER.resources)
  

@route('/viewTest')
def systemView():
    return template('tpl/systemView',
        asteroidDB='db/test_asteroids.js',
        ownersDB='db/test_owners.js',
        pageTitle="ViewTest"
        )

@route('/sysView')
def sysView():
    OOIs.write2JSON(OOI_JSON_FILE,OWNERS_JSON_FILE)
    return template('tpl/sysView',
            asteroidDB=OOI_JSON_FILE,
            ownersDB=OWNERS_JSON_FILE,
            chunks=CHUNKS,
            messages=MESSAGES,message_count=2,
            note_count=1,notes=NOTES,
            task_count=4,tasks=TASKS,
            user=USER,
            pageTitle="Solar System",
            resources=USER.resources)

@route('/addAsteroid')
def addOOI():
    name = request.query.name
    OOIs.addObject(python.getAsteroid.byName(name))
    print 'object '+name+' added to OOIs'
    return template('tpl/asteroidAdd',objectName=name,chunks=CHUNKS,
            messages=MESSAGES,message_count=2,
            note_count=1,notes=NOTES,
            task_count=4,tasks=TASKS,
            user=USER,
            resources=USER.resources)


@route('/getAsteroids')
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
    return OOI_JSON_FILE


#=====================================#
#         DataBase Management         #
#=====================================#

# SQLite test
@route('/data')
def database():
    con = lite.connect('test.db')
    with con:
        cur = con.cursor()
        cur.execute('SELECT SQLITE_VERSION()')
        data = cur.fetchone()
        return "SQLite version: %s" % data


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
@route('/login<:re:/?>')
def login():
    params = dict(
        scope='email profile',
        response_type='code',
        redirect_uri=redirect_uri
    )
    url = google.get_authorize_url(**params)
    app.redirect(url)

# Successful login
@route('/success<:re:/?>')
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
    run(host='0.0.0.0', port=port)