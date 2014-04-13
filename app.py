#!/usr/bin/env python

import os
from python.bottle import route, run, static_file, template, view, post, request
import sqlite3 as lite
import sys

from python.OOIs import OOIs


# Static Routing
@route('/<filename:path>')
def assets_static(filename):
    return static_file(filename, root='./')

# set up external python app routings:
import python.getAsteroid
import python.search


from python.page_maker.chunks import chunks # global chunks
from python.page_maker.Message import Message
from python.page_maker.Note import Note
from python.page_maker.Task import Task
from python.page_maker.User import User

CHUNKS = chunks()
OOIs = OOIs()

@route("/")
@view("main")
def hello():
    return template('tpl/main_body',chunks=CHUNKS,
        messages=[Message(),Message()],message_count=2,
        note_count=1,notes=[Note()],
        task_count=4,tasks=[Task(),Task(),Task(),Task()],
        user=User())


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

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7099))
    run(host='0.0.0.0', port=port)