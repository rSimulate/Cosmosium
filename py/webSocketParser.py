import json
from ast import literal_eval


from bottle import template

from py.game_logic.user.User import User
from py.generate_traj import gen_traj
from py.page_maker.chunks import chunks
from py.page_maker.Settings import Settings
from asteroid_tracker import asteroid_track_request_responder


CHUNKS = chunks()

class SetEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        return json.JSONEncoder.default(self, obj)

def registerUserConnection(user, ws):
    # saves user websocket connetion so that updates to the user object can push to the client
    user.websocket = ws
    user.disconnected = False


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


class ObjectCommands(object):  # TODO: these could be enumerated
    create = 'create'
    query = 'query'
    destroy = 'destroy'


def playerObjectResponder(user, data):
    """
    :param user: the requesting user
    :param ws:
    :param data: data as a string
    :return:create
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
        if cmdName == ObjectCommands.create:
            # TODO: Check and see if there's enough resources to grant the request
            objectType = pData['type']
            model = pData['model']
            orbit = pData['orbit']

            message = '{"cmd":"pObjCreate","data":"'
            message += str(game.addPlayerObject(objectType, model, orbit, user.name))
            message += '"}'

            user.sendMessage(message)

        elif cmdName == ObjectCommands.query:
            uuid = pData['uuid']

            message = '{"cmd":"pObjRequest","data":"'
            message += str(game.getPlayerObject(uuid))
            message += '"}'

            user.sendMessage(message)

        elif cmdName == ObjectCommands.destroy:
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


class SurveyTypes(object):  # TODO: these could be enumerated
    neo = 'NEO'
    main_belt = 'MainBelt'
    kuiper_belt = 'KuiperBelt'
    solar_system = 'SolarSystem'


def surveyResponder(data, user):
    # {'survey': 'MainBelt', 'amt': 0}
    # Amt of 0 == all asteroids in survey
    try:
        survey_data = literal_eval(data)
    except ValueError:
        print 'malformed data dict string from websock:', data
        return
    survey_type = survey_data['survey']
    if survey_type in [SurveyTypes.neo, SurveyTypes.main_belt, SurveyTypes.kuiper_belt, SurveyTypes.solar_system]:
        user.game.synchronizeSurvey(user, survey_type, int(survey_data['amt']))
    else:
        print "ERROR: Player", user.name, "requested an unknown asteroid survey"


def refreshResponder(user):
    print "Refresh recieved"
    user.disconnected = False
    user.game.refreshClient(user)


def trajRequestResponder(user, data):
    # {'dest': {'type': 'planet', 'objectId': 'objectId'}, 'source': {'type': 'Probe', 'objectId': 'objectId'}, 'res': N-val}
    trajData = literal_eval(data)

    if trajData['source']['type'] != 'playerObject':
        print "ERROR: Trajectory request came from a non-player object:", trajData['source']['type']
        return

    if user.game is not None:
        source = user.game.getObject(trajData['source']['objectId'], type=trajData['source']['type'])
        dest = user.game.getObject(trajData['dest']['objectId'], type=trajData['dest']['type'])

        if source is not None and dest is not None:
            launchTimeOffset = 15
            #TODO: Change arrivalTime to the actual time?
            launchTime = user.game.time(True, False) + launchTimeOffset
            arrivalTime = launchTime + 365

            traj = gen_traj(source, dest, launchTime, arrivalTime, 0, trajData['res'])
            data = {'source': trajData['source']['objectId'],
                    'traj': traj}
            data = json.dumps(data, cls=SetEncoder)

            message = '{"cmd":"trajReturn","data":"'
            message += data
            message += '"}'

            user.sendMessage(message)
            print "Sending traj to user", user.name
        else:
            print "ERROR: Trajectory request source and/or destination was not able to be identified"


def loginUser(user, USERS, data):
    info = literal_eval(data)
    username = info['username']
    password = info['password']

    def createUser(name, icon, agency, subtext):
        use = User()
        use.setProfileInfo(name, icon, agency, subtext)
        return use


class Commands(object):  # TODO: these could be enumerated
    claim = 'claim'
    get_survey = 'getSurvey'
    hello = 'hello'
    refresh = 'refresh'
    research = 'research'
    player_object = 'playerObject'
    request_trajectory = 'requestTraj'


def parse(cmd, data, user, websock, OOIs=None, GAMES=None):
    print 'received', cmd, 'from', user.name
    # takes appropriate action on the given command and data string
    if cmd == Commands.claim:
        asteroid_track_request_responder(data, user)
    elif cmd == Commands.get_survey:
        surveyResponder(data, user)
    # TODO: Send asteroid limit for user on hello
    elif cmd == Commands.hello:
        registerUserConnection(user, websock)
    # elif cmd == 'register':
        # registerNewUser(user, data)
    # elif cmd == 'login':
        # loginUser(user, data, USERS)
    elif cmd == Commands.refresh:
        refreshResponder(user)
    elif cmd == Commands.research:
        researchResponder(user, data)
    elif cmd == Commands.player_object:
        playerObjectResponder(user, data)
    elif cmd == Commands.request_trajectory:
        trajRequestResponder(user, data)
    else:
        print "UNKNOWN CLIENT MESSAGE: cmd=", cmd, "data=", data, " from user ", user
