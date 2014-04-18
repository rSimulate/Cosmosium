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
from python.bottle import route, run, static_file, template, view, post, request, error
import sqlite3 as lite
import sys
import json
import pymongo # import Connection

# OAuth components
import rauth
import config

# Template Components
from python.page_maker.chunks import chunks # global chunks
from python.page_maker.User import User
from python.page_maker.Settings import Settings
from python.OOIs import OOIs


#=====================================#
#         Page Templating             #
#=====================================#

# Global Variables as Site Chunks
CHUNKS = chunks()
OOIs = OOIs()
USER = User()
MASTER_CONFIG = 'default' # this is the config keyword for all non-test pages. (see Config.py for more info)

#=====================================#
#            Static Routing           #
#=====================================#
@route('/<filename:path>')
def assets_static(filename):
    return static_file(filename, root='./')

#=====================================#
#           Custom 404                #
#=====================================#
@error(404)
def error404(error):
    return template('tpl/404',chunks=CHUNKS,
        user=USER,
        config=Settings(MASTER_CONFIG),
        pageTitle="LOST IN SPACE")

#=====================================#
#           Dashboard Route           #
#=====================================#
@route("/")
#@view("main")
def hello():
    return template('tpl/pages/dash',chunks=CHUNKS,
        user=USER,
        config=Settings(MASTER_CONFIG),
        pageTitle="Main Control Panel")

#=====================================#
#           Mission  Pages            #
#=====================================#
@route('/missionControl')
def  missionControl():
		return template('tpl/pages/missionControl',
            config=Settings(MASTER_CONFIG),
            chunks=CHUNKS,
            user=USER,
            pageTitle="Mission Planning & Control Center",
            resources=USER.resources)

@route('/launchpad')
def launchPad():
    return template('tpl/pages/launchpad',
        config=Settings(MASTER_CONFIG),
        chunks=CHUNKS,
        user=USER,
        pageTitle="Launch Facilities")

@route('/observatories')
def launchPad():
    return template('tpl/pages/observatories',
        config=Settings(MASTER_CONFIG),
        chunks=CHUNKS,
        user=USER,
        pageTitle="Main Observational Astronomy Facilities")

#=====================================#
#           Research Pages            #
#=====================================#
@route('/research')
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
@route('/funding')
def fundingPage():
    return template('tpl/funding',chunks=CHUNKS,
        config=Settings(MASTER_CONFIG),
        user=USER,
        pageTitle="Funding")


#=====================================#
#        Asteroid Views Routing       #
#=====================================#
# external python app routings (controllers):
import python.getAsteroid
import python.search

# these is here to circumvent global variable issues
@route('/systemView')
def systemView():
    return template('tpl/systemView',
        user=USER,
        chunks=CHUNKS,
        config=Settings('test',showFrame=False,showResources=False,showBG=False),   # this is teporarily set to test so it looks nice.
        pageTitle="ViewTest"
        )


@route('/viewTest')
def systemView():
    return template('tpl/systemView',
        user=USER,
        chunks=CHUNKS,
        config=Settings(MASTER_CONFIG),
        pageTitle="ViewTest"
        )

@route('/sysView')
def sysView():
    OOIs.write2JSON(OOI_JSON_FILE,OWNERS_JSON_FILE)
    return template('tpl/sysView',
            config=Settings(MASTER_CONFIG),
            chunks=CHUNKS,
            user=USER,
            pageTitle="Solar System")

@route('/addAsteroid')
def addOOI():
    name = request.query.name
    OOIs.addObject(python.getAsteroid.byName(name))
    print 'object '+name+' added to OOIs'
    return template('tpl/pages/asteroidAdd',objectName=name,chunks=CHUNKS,
        config=Settings(MASTER_CONFIG),
        pageTitle='Asteroid Add Request Approved',
        user=USER)

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
    return Settings(MASTER_CONFIG).asteroidsDB

#=====================================#
#           User Actions              #
#=====================================#
# @route('/upgradeTech')
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
@route('/data')
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
# main
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
    main(sys.argv[1:]) # Invokes Mongo
