#!/usr/bin/env python

import os
from python.bottle import route, run, static_file, template, view, post, request
import sqlite3 as lite
import sys
import json


from python.page_maker.chunks import chunks # global chunks
from python.page_maker.Message import Message
from python.page_maker.Note import Note
from python.page_maker.Task import Task
from python.page_maker.User import User
from python.OOIs import OOIs

# globals
CHUNKS = chunks()
OOIs = OOIs()
MESSAGES = [Message(),Message()]
NOTES = [Note()]
TASKS = [Task(),Task(),Task(),Task()]
USER = User()
OOI_JSON_FILE = 'db/OOIs.js'

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
        user=USER)
        
# set up external python app routings (controllers):
import python.getAsteroid
import python.search

# these is here to circumvent global variable issues
@route('/systemView')
def searchTest():
    OOIs.write2JSON(OOI_JSON_FILE)
    return template('tpl/systemView',asteroidDB=OOI_JSON_FILE)

@route('/addAsteroid')
def addOOI():
    name = request.query.name
    OOIs.addObject(python.getAsteroid.byName(name))
    print 'object '+name+' added to OOIs'
    return template('tpl/asteroidAdd',objectName=name,chunks=CHUNKS,
            messages=MESSAGES,message_count=2,
            note_count=1,notes=NOTES,
            task_count=4,tasks=TASKS,
            user=USER)
    
# NOTE: THIS IS NOT USED. I wasted an hour trying to get it to work though
#   and we may need it later.    
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


# SQLite test
@route('/data')
def database():
    con = lite.connect('test.db')
    with con:
        cur = con.cursor()
        cur.execute('SELECT SQLITE_VERSION()')
        data = cur.fetchone()
        return "SQLite version: %s" % data


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7099))
    run(host='0.0.0.0', port=port)