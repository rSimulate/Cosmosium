
from bottle import route, run, request, template

@route('/searchtest')
def searchTest():
    return template('tpl/systemView',asteroidDB="db/test_asteroids.js")
    
@route('/searchNEOs')
def searchNEOs():
    return template('tpl/systemView',asteroidDB="db/NEOs.js")
    
@route('/searchMainBelt')
def searchNEOs():
    return template('tpl/systemView',asteroidDB="db/MainBelt.js")
    
@route('/searchKuiperBelt')
def searchNEOs():
    return template('tpl/systemView',asteroidDB="db/KuiperBelt.js")

if __name__ == "__main__":
    run(host='localhost', port=8080, debug=True)
