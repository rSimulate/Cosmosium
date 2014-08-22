import os
import random
import string
import datetime
from ast import literal_eval

from Crypto.Hash import SHA256
from pymongo import MongoClient
from bottle import template, redirect, response

from py.game_logic.user.User import User
from py.page_maker.chunks import chunks
from py.page_maker.Settings import Settings
from lib.PyKEP import getTraj
from asteroid_tracker import asteroid_track_request_responder


CHUNKS = chunks()


def registerUserConnection(user, ws):
    # saves user websocket connetion so that updates to the user object can push to the client
    user.websocket = ws


def researchResponder(user, researchType):
    message = '{"cmd":"addToContent","data":"'

    if user.purchase('research_' + researchType):
        user.research.advance()
        message += template('tpl/content/tiles/purchase_success',
                            chunks=CHUNKS,
                            config=Settings('default'),
                            pageTitle='research complete',
                            user=user)
    else:
        message += template('tpl/content/tiles/insufficientFunds',
                            chunks=CHUNKS,
                            config=Settings('default'),
                            pageTitle='research denied',
                            user=user)
    message += '"}'
    user.sendMessage(message)


def playerObjectResponder(user, data):
    """

    :param user: the requesting user
    :param ws:
    :param data: data as a string
    :return:
    """
    game = user.game
    if game is not None:
        # Data Example
        # {'data': {'cmd': 'create', 'orbit': {'a': 1.00000261, 'om': 0, 'e': 0.01671123, 'i': 1.531e-05,
        # 'L': 100.46457166, 'P': 365.256, 'epoch': 2451545, 'w': 102.93768193, 'w_bar': 102.93768193,
        # 'ma': -2.47311027}}, 'model': 'magellan', 'cmd': 'pObjCreate', 'type': 'probe', 'objectId': None}
        data = literal_eval(data)

        pData = data['data']
        cmdName = pData['cmd']
        if cmdName == 'create':
            # TODO: Check and see if there's enough resources to grant the request
            objectType = pData['type']
            model = pData['model']
            orbit = pData['orbit']

            message = '{"cmd":"pObjCreate","data":"'
            message += str(game.addPlayerObject(objectType, model, orbit, user.name))
            message += '"}'

            user.sendMessage(message)

        elif cmdName == 'query':
            uuid = pData['uuid']

            message = '{"cmd":"pObjRequest","data":"'
            message += str(game.getPlayerObject(uuid))
            message += '"}'

            user.sendMessage(message)

        elif cmdName == 'destroy':
            uuid = pData['uuid']
            result = game.removePlayerObject(uuid, user.name)

            # TODO: provide an actual reason for failing to remove an object
            # TODO: Send back success along with possible recovered res from destroyed object
            if result:
                obj = {'result': str(result), 'objectId': uuid, 'reason': str(result)}
                print "syncronizing clients for removal of object", uuid
                game.synchronizeObjectRemoval(obj)
            else:
                obj = {'result': str(result), 'objectId': uuid, 'reason': str(result)}
                message = '{"cmd":"pObjDestroyRequest","data":"'
                message += str(obj)
                message += '"}'
                user.sendMessage(message)


def surveyResponder(data, user):
    # {'survey': 'MainBelt', 'amt': 0}
    # Amt of 0 == all asteroids in survey
    surveyData = literal_eval(data)
    if surveyData['survey'] == 'NEO':
        user.game.synchronizeSurvey(user, 'NEO', int(surveyData['amt']))

    elif surveyData['survey'] == 'MainBelt':
        user.game.synchronizeSurvey(user, 'MainBelt', int(surveyData['amt']))

    elif surveyData['survey'] == 'KuiperBelt':
        user.game.synchronizeSurvey(user, 'KuiperBelt', int(surveyData['amt']))

    elif surveyData['survey'] == 'SolarSystem':
        user.game.synchronizeSurvey(user, 'SolarSystem', int(surveyData['amt']))

    else:
        print "ERROR: Player", user.name, "requested an unknown asteroid survey"


def refreshResponder(user):
    user.game.synchronizeObjects(user)


def trajRequestResponder(user, data):
    # {'dest': {'type': 'planet', 'objectId': 'objectId'}, 'source': {'type': 'Probe', 'objectId': 'objectId'}}
    trajData = literal_eval(data)

    if trajData['source']['type'] != 'Probe':
        print "ERROR: Trajectory request came from a non-player object"
        return

    if user.game is not None:
        source = user.game.getObject(trajData['source']['objectId'], type=trajData['source']['type'])
        dest = user.game.getObject(trajData['dest']['objectId'], type=trajData['dest']['type'])

        if source is not None and dest is not None:
            # getTraj()
            print "Source and destination is not none. Getting trajectory."

def loginUser(user, USERS, data):
    info = literal_eval(data)
    username = info['username']
    password = info['password']

    def createUser(name, icon, agency, subtext):
        use = User()
        use.setProfileInfo(name, icon, agency, subtext)
        return use

    # userObj = createUser(username, '/img/profiles/martin2.png', mongo_org, mongo_quote)


def parse(cmd, data, user, websock, OOIs=None, GAMES=None):
    # takes appropriate action on the given command and data string
    if cmd == 'claim':
        asteroid_track_request_responder(data, user)
    elif cmd == 'getSurvey':
        surveyResponder(data, user)
    # TODO: Send asteroid limit for user on hello
    elif cmd == 'hello':
        registerUserConnection(user, websock)
    # elif cmd == 'register':
        # registerNewUser(user, data)
    # elif cmd == 'login':
        # loginUser(user, data, USERS)
    elif cmd == 'refresh':
        refreshResponder(user)
    elif cmd == 'research':
        researchResponder(user, data)
    elif cmd == 'playerObject':
        playerObjectResponder(user, data)
    elif cmd == 'requestTraj':
        trajRequestResponder(user, data)
    else:
        print "UNKNOWN CLIENT MESSAGE: cmd=", cmd, "data=", data, " from user ", user
