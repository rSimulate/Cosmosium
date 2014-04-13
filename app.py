#!/usr/bin/env python

import os
from python.bottle import route, run, static_file, template, view, post, request
import sqlite3 as lite
import sys

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

# set up external python app routings (controllers):
import python.getAsteroid
import python.search

# this is here to circumvent global variable issues
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


# SQLite test
@route('/data')
def database():
    con = lite.connect('test.db')
    with con:
        cur = con.cursor()
        cur.execute('SELECT SQLITE_VERSION()')
        data = cur.fetchone()
        return "SQLite version: %s" % data


# all index.html
>>>>>>> 0c312e11366fcc30e95b09d1fd052b93e9d46478

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7099))
    run(host='0.0.0.0', port=port)