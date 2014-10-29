# defines a game instance, containing all information that might pass back and forth
# between players of the game.
from time import time as rTime
from jdcal import gcal2jd
import datetime
from threading import Thread, Event
import uuid
from random import randint

import py.AsteroidDB as asteroidDB
from py.BodyDB import BodyDB
from py.game_logic.mockEventList import getMockEventList
from py.webSocketParser import SurveyTypes

GAME_LEN = 60  # max length of game in minutes
DAYS_PER_SEC = 3  # how many days pass per second
GAME_YEAR_SPAN = 200  # years spanned by a max-len game
START_YEAR = 2005  # starting year of game
TIME_UPDATE_FREQ = 1  # client clock sync frequency in seconds

class Game(object):
    def __init__(self):
        print "New game instance initializing..."
        # Instantiate the body database with the moons adjusted by DAYS_PER_SEC*2 deviated from zero
        self.bodies = BodyDB(DAYS_PER_SEC*2).getBodies()
        # self.OOIs = OOIs()
        # TODO: Replace this with MPO data
        self.NEOs = list()
        for asteroid in asteroidDB.getAsteroidSurvey(SurveyTypes.neo):
            self.NEOs.append(self.cleanAsteroidObject(asteroid))

        self.mainBelt = list()
        for asteroid in asteroidDB.getAsteroidSurvey(SurveyTypes.main_belt):
            self.mainBelt.append(self.cleanAsteroidObject(asteroid))

        self.kuiperBelt = list()
        for asteroid in asteroidDB.getAsteroidSurvey(SurveyTypes.kuiper_belt):
            self.kuiperBelt.append(self.cleanAsteroidObject(asteroid))

        self.OOIs = self.NEOs + self.mainBelt + self.kuiperBelt
        self.id = uuid.uuid4()
        self.players = list()
        self.playerObjects = list()
        self.eventList = getMockEventList()
        self._epoch = int(rTime())  # real-time game start

        self.colors = list()
        self.colors.append({'player': None, 'color': '0xff0000'})
        self.colors.append({'player': None, 'color': '0x00ff00'})
        self.colors.append({'player': None, 'color': '0x0000ff'})
        self.colors.append({'player': None, 'color': '0xffff00'})
        self.colors.append({'player': None, 'color': '0xff00ff'})

        self.date = datetime.date(START_YEAR, 4, 1)

        timer = Timer(1.0, self.timeSync)
        timer.daemon = True
        timer.start()


    def cleanAsteroidObject(self, asteroid):
        H = asteroid['H']
        diameter = asteroid['diameter']

        if H == "":
            H = "_"
        if diameter == "":
            diameter = "_"

        cleaned = {
            'type': 'asteroid',
            'model': asteroid['full_name'].split()[0] + '_' + asteroid['name'],
            'objectId': str(uuid.uuid4()),
            'owner': 'UNCLAIMED',
            'orbitExtras': {'H': asteroid['H'], 'diameter': asteroid['diameter']},
            'orbit': {'a': asteroid['a'], 'om': asteroid['om'], 'e': asteroid['e'], 'i': asteroid['i'],
                      'L': asteroid['n'], 'P': asteroid['per'], 'epoch': asteroid['epoch'], 'w': asteroid['w'],
                      'w_bar': (int(asteroid['w']) + int(asteroid['om'])), 'ma': asteroid['ma'],
                      'full_name': asteroid['full_name'].split()[0] + '_' + asteroid['name']}}
        return cleaned
        
    def timeSync(self, t=None):
        # returns current in-game time representation as a string
        # if t is given, in-game time at given time t
        if t is None:
            t = rTime()

        secsPassed = int(t-self._epoch)  # real-time
        self.date += datetime.timedelta(days=DAYS_PER_SEC)

        if secsPassed % TIME_UPDATE_FREQ == 0:
            for player in self.players:
                message = '{"cmd":"timeSync","data":"'
                message += str({'jed': self.time(jd=True),
                                'gec': self.time(net=True)})
                message += '"}'
                player.sendMessage(message)

    def time(self, jd=False, net=False):
        # returns current in-game time representation as a string
        delim = " "
        if net is True:
            delim = '-'

        if jd is True:
            return sum(gcal2jd(self.date.year, self.date.month, self.date.day))

        return self.date.strftime('%d')+delim+self.date.strftime('%b')+delim+self.date.strftime('%Y')
        
    def addPlayer(self, player):
        print "game instance", self.id, "is adding player", player.name
        # adds a player to the current game
        player.setGame(self)
        self.players.append(player)
        self._assignColorToPlayer(player)

    def changeAsteroidOwner(self, newOwner, objectId, user):
        for asteroid in self.OOIs:
            if asteroid['objectId'] == objectId:
                asteroid['owner'] = newOwner

                for player in self.players:
                    if player is not user:
                        player.sendMessage("{'cmd':'claim',data:{'result': 'accepted', 'owner': "+str(user.name)+
                                                          ", 'objectId': "+objectId+"}}")

                return asteroid['objectId']

    def _assignColorToPlayer(self, player):
        newColor = None
        name = ''.join(map(lambda x: x.encode('ascii'), player.name))
        for color in self.colors:
            if color['player'] is None or color['player'] == name:
                color['player'] = name
                newColor = color
                print color
                break
        if newColor is None:
            print "Another player is joining the server, " \
                  "but we've ran out of solid colors to assign. Assigning random color"

            def convertColor(i):
                if i >= 10:
                    i -= 10
                    hex = list()
                    hex.append('a')
                    hex.append('b')
                    hex.append('c')
                    hex.append('d')
                    hex.append('e')
                    hex.append('f')
                    return str(hex[i])
                return str(i)
            tmpColor = '0x' + convertColor(randint(0, 15))+convertColor(randint(0, 15)) + convertColor(randint(0, 15))+\
                                convertColor(randint(0, 15)) + convertColor(randint(0, 15))+convertColor(randint(0, 15))
            newColor = {'player': ''.join(map(lambda x: x.encode('ascii'), player.name)), 'color': tmpColor}
            self.colors.append(newColor)

        for player in self.players:
            message = '{"cmd":"assignColor","data":"'
            message += str(newColor)
            message += '"}'
            player.sendMessage(message)

    def synchronizeSurvey(self, player, survey, amt):

        def sendSurvey(asteroidList, amount, player):
            if amount == 0:
                amount = asteroidList.__len__()
                for i in range(amount):
                    message = '{"cmd":"addAsteroid","data":"'
                    obj = asteroidList[i]
                    message += str(obj)
                    message += '"}'
                    print "sending asteroid", obj['objectId'], '(',i+1, "out of", amount,')', "to", player.name
                    player.sendMessage(message)
            else:
                for i in range(amount):
                    message = '{"cmd":"addAsteroid","data":"'
                    index = randint(0, asteroidList.__len__()-1)
                    obj = asteroidList[index]
                    message += str(obj)
                    message += '"}'
                    print "sending asteroid", obj['objectId'], '(',i+1, "out of", player.asteroidLimit,')', "to", player.name
                    player.sendMessage(message)

        if survey == 'NEO':
            sendSurvey(self.NEOs, amt, player)
        elif survey == 'MainBelt':
            sendSurvey(self.mainBelt, amt, player)
        elif survey == 'KuiperBelt':
            sendSurvey(self.kuiperBelt, amt, player)
        elif survey == 'SolarSystem':
            sendSurvey(self.OOIs, amt, player)
        else:
            print "ERROR: Player", player.name, "requested an unknown asteroid survey"

    def synchronizeObjects(self, player):
        # Ensure planets are sent first
        for body in self.bodies:
            if body['type'] == 'planet':
                message = '{"cmd":"bodyCreate","data":"'
                message += str(body)
                message += '"}'
                print "sending body", body['orbit']['full_name'], "to", player.name
                player.sendMessage(message)
        for body in self.bodies:
            if body['type'] == 'moon':
                message = '{"cmd":"bodyCreate","data":"'
                message += str(body)
                message += '"}'
                print "sending body", body['orbit']['full_name'], "to", player.name
                player.sendMessage(message)

        for obj in self.playerObjects:
            message = '{"cmd":"pObjCreate","data":"'
            message += str(obj)
            message += '"}'
            print "sending object", obj['objectId'], "to", player.name
            player.sendMessage(message)

        for color in self.colors:
            if color['player'] is not None:
                message = '{"cmd":"assignColor","data":"'
                message += str(color)
                message += '"}'
                player.sendMessage(message)

    def synchronizeClientsForObject(self, obj):
        print "synchronizing clients for object", obj['objectId']
        for player in self.players:
            message = '{"cmd":"pObjCreate","data":"'
            message += str(obj)
            message += '"}'
            print "sending object", obj['objectId'], "to", player.name
            player.sendMessage(message)

    def synchronizeObjectRemoval(self, obj):
        message = '{"cmd":"pObjDestroyRequest","data":"'
        message += str(obj)
        message += '"}'

        for player in self.players:
            player.sendMessage(message)
        
    def addObject(self, object, ownerName=None):
        # adds object to track to OOIs
        self.OOIs.addObject(object, ownerName)

    def addPlayerObject(self, objectType, model, orbit, ownerName):
        """
        Adds a player object to the instance
        :return: The object as a dict
        """
        pUuid = uuid.uuid4()
        # translate unicode to ascii for net transfer
        name = ''.join(map(lambda x: x.encode('ascii'), ownerName))
        uniqueId = 1

        for o in self.playerObjects:
            if (o['owner'] == name) & (o['model'] == model):
                uniqueId += 1

        orbit['full_name'] = name + "--s_" + model + "_" + objectType + "_" + str(uniqueId)
        obj = {'owner': str(name), 'objectId': str(pUuid), 'type': objectType, 'model': model, 'orbit': orbit}
        print "added player object", obj['model'], "for owner", obj['owner'], "with objectId", obj['objectId']
        self.playerObjects.append(obj)
        self.synchronizeClientsForObject(obj)
        return obj

    def getObject(self, objectId, type=None):
        if type == 'playerObject' or type is None:
            for obj in self.playerObjects:
                if obj['objectId'] == objectId:
                    return obj

        if type == 'asteroid' or type is None:
            for obj in self.OOIs:
                if obj['objectId'] == objectId:
                    return obj

        if type == 'planet' or type == 'moon' or type is None:
            for obj in self.bodies:
                if obj['objectId'] == objectId:
                    return obj

        print "ERROR: Could not find object in game instance"
        return None

    def getPlayerObject(self, objectId):
        """
        gets player object from this instance
        :param uuid: The UUID of the object
        :return: object if found, None if not
        """

        for obj in self.playerObjects:
            if obj['objectId'] == objectId:
                return obj

        return None

    def removePlayerObject(self, objectId, fromUser):
        """
        Removes player object from instance
        :param objectId: The UUID of the object
        :return: False if removal fails, True if object was removed
        """
        objectId = str(objectId)
        fromUser = str(fromUser)
        rObject = None
        for object in self.playerObjects:
            # print object['owner'], type(object['owner']), fromUser, type(fromUser)
            # print object['objectId'], type(object['objectId']), objectId, type(objectId)
            if (object['objectId'] == objectId) & (object['owner'] == fromUser):
                rObject = object

        if rObject is not None:
            try:
                self.playerObjects.remove(rObject)
            except ValueError:
                print "Could not find objectId", objectId, "to remove"
                return False
            finally:
                return True

        if rObject is None:
            print "Player", fromUser, "tried to remove an object that they didn't own, " \
                                      "or that we could not find in the list! DENIED."
        return False

    def inGame(self, uName):
        # returns true if user is in game, else returns false
        for user in self.players:

            if user.name == uName:
                return True
        else:
            return False

    def refreshClient(self, user):
        self.synchronizeObjects(user)

class Timer(Thread):
    def __init__(self, secs, function):
        Thread.__init__(self)
        self.event = Event()
        self.secs = secs
        self.function = function

    def run(self):
        while not self.event.is_set():
            self.function()
            self.event.wait(self.secs)

    def stop(self):
        self.event.set()