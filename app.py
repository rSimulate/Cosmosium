#!/usr/bin/env python

import os
from bottle import route, run, static_file, template, view, post, request

# Static Routing
@route('/<filename:path>')
def assets_static(filename):
    return static_file(filename, root='./')


@route("/")
@view("main")
def hello():
        return template('{{text}}',text='This is index page!')

 #all index.html

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7099))
    run(host='0.0.0.0', port=port)