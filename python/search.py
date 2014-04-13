
from bottle import route, run, request, template

@route('/searchtest')
def searchTest():
    return template('tpl/systemView',asteroidDB="db/test_asteroids.js")
    
@route('/searchNEOs')
def searchNEOs():
    return template('tpl/systemView',asteroidDB="db/NEOs.js")

if __name__ == "__main__":
    run(host='localhost', port=8080, debug=True)
