#!/usr/bin/env python

import os
from bottle import route, run, static_file, template, view, post, request

# Static Routing
@route('/<filename:path>')
def assets_static(filename):
    return static_file(filename, root='./')
    
# set up external python app routings:
import python.getAsteroid


from python.page_maker.chunks import chunks # global chunks
from python.page_maker.Message import Message

@route("/")
@view("main")
def hello():
    CHUNKS = chunks()
    return template('main_body',chunks=CHUNKS,messages=[Message(),Message()])

 #all index.html

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7099))
    run(host='0.0.0.0', port=port)