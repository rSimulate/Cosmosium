#!/usr/bin/env python

import os
from python.bottle import route, run, static_file, template, view, post, request

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

@route("/")
@view("main")
def hello():
    CHUNKS = chunks()
    return template('tpl/main_body',chunks=CHUNKS,
        messages=[Message(),Message()],message_count=2,
        note_count=1,notes=[Note()],
        task_count=4,tasks=[Task(),Task(),Task(),Task()],
        user=User())

 #all index.html

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7099))
    run(host='0.0.0.0', port=port)