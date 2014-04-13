#!/usr/bin/env python

import os
from bottle import route, run, static_file, template, view, post, request

# Main Static Passing Calls

@route('/css/<filename>')
def assets_static(filename):
    return static_file(filename, root='./css')

@route('/db/<filename>')
def images_static(filename):
    return static_file(filename, root='./db')

@route('/fonts/<filename>')
def bootstrap_css_static(filename):
    return static_file(filename, root='./fonts')

@route('/img/<filename>')
def bootstrap_img_static(filename):
    return static_file(filename, root='./img')

@route('/js/<filename>')
def bootstrap_js_static(filename):
    return static_file(filename, root='./js')

@route('/less/<filename>')
def vendors_static(filename):
    return static_file(filename, root='./less')

@route('/pages/<filename>')
def vendors_static(filename):
    return static_file(filename, root='./pages')

@route('/templates/<filename>')
def vendors_static(filename):
    return static_file(filename, root='./templates')

# Additional Static Call
@route('/static/:filename:')
def send_static(filename):
    return static_file(filename, root='./static/')

# Static Routing

@route("/")
@view("main")
def hello():
        return template('template',text='This is index page!')

 #all index.html

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7099))
    run(host='0.0.0.0', port=port)