# defines a game instance, containing all information that might pass back and forth
# between players of the game.
from time import time
from calendar import month_abbr
import uuid
from random import randint

from py.OOIs import OOIs
import py.AsteroidDB as asteroidDB
from py.game_logic.mockEventList import getMockEventList

GAME_LEN = 60 # max length of game in minutes
GAME_YEAR_SPAN = 200 # years spanned by a max-len game
START_YEAR = 1969 # starting year of game


class Game(object):
    def __init__(self):
        print "New game instance initializing..."
        # self.OOIs = OOIs()
        # TODO: Replace this with MPO data
        self.NEOs = list()
        for asteroid in asteroidDB.getAsteroidSurvey('NEO'):
            self.NEOs.append(self.cleanAsteroidObject(asteroid))

        self.mainBelt = list()
        for asteroid in asteroidDB.getAsteroidSurvey('MainBelt'):
            self.mainBelt.append(self.cleanAsteroidObject(asteroid))

        self.kuiperBelt = list()
        for asteroid in asteroidDB.getAsteroidSurvey('KuiperBelt'):
            self.kuiperBelt.append(self.cleanAsteroidObject(asteroid))

        self.OOIs = self.NEOs + self.mainBelt + self.kuiperBelt
        self.id = uuid.uuid4()
        self.players = list()
        self.playerObjects = list()
        self.eventList = getMockEventList()
        self._epoch = int(time())  # real-time game start
        ephemeris = {
            'ma': -2.47311027,
            'epoch': 2451545.0,
            'a': 2.00000261,
            'e': 0.02671123,
            'i': 0.00001531,
            'w_bar': 102.93768193,
            'w': 102.93768193,
            'L': 100.46457166,
            'om': 0,
            'P': 365.256
        }
        self.addPlayerObject("Probe", "Magellan", ephemeris, "test_user")

        self.colors = list()
        self.colors.append({'player': None, 'color': '0xff0000'})
        self.colors.append({'player': None, 'color': '0x00ff00'})
        self.colors.append({'player': None, 'color': '0x0000ff'})
        self.colors.append({'player': None, 'color': '0xffff00'})
        self.colors.append({'player': None, 'color': '0xff00ff'})

    def cleanAsteroidObject(self, asteroid):
        H = asteroid['H']
        diameter = asteroid['diameter']

        if H == "":
            H = "_"
        if diameter == "":
            diameter = "_"

        cleaned = {
            'type': 'asteroid',
            'model': 'asteroid',
            'objectId': str(uuid.uuid4()),
            'owner': 'UNCLAIMED',
            'orbitExtras': {'H': asteroid['H'], 'diameter': asteroid['diameter']},
            'orbit': {'a': asteroid['a'], 'om': asteroid['om'], 'e': asteroid['e'], 'i': asteroid['i'],
                      'L': asteroid['n'], 'P': asteroid['per'], 'epoch': asteroid['epoch'], 'w': asteroid['w'],
                      'w_bar': (int(asteroid['w']) + int(asteroid['om'])), 'ma': asteroid['ma'],
                      'full_name': asteroid['full_name'].split()[0] + '_' + asteroid['name']}}
        return cleaned
        
    def time(self, t=None):
        # returns current in-game time representation as a string 
        # if t is given, in-game time at given time t
        if t is None:
            t = time()
        secsPassed = int(t-self._epoch)  # real-time
        yearsPassed = float(secsPassed)/self.getDeltaYearUpdate()  # game-time
        month = int(yearsPassed%1*12)
        year  = int(yearsPassed)+START_YEAR
        return month_abbr[month+1]+' '+str(year)
            
    def getDeltaYearUpdate(self):
        # returns time (in real seconds) between year changes in game-time
        return GAME_LEN*60/GAME_YEAR_SPAN  # real-time sec / 1 game_year
        
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
                        if player.websocket is not None:
                            player.websocket.send("{'cmd':'claim',data:{'result': 'accepted', 'owner': "+newOwner +
                                                  ", 'objectId': "+objectId+"}}")
                        else:
                            print "Tried to send asteroid owner change request to", str(player.name) +\
                                  ", but user has no websocket."

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
            if player.websocket is not None:
                message = '{"cmd":"assignColor","data":"'
                message += str(newColor)
                message += '"}'
                player.websocket.send(message)

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
                    player.websocket.send(message)
            else:
                for i in range(amount):
                    message = '{"cmd":"addAsteroid","data":"'
                    index = randint(0, asteroidList.__len__()-1)
                    obj = asteroidList[index]
                    message += str(obj)
                    message += '"}'
                    print "sending asteroid", obj['objectId'], '(',i+1, "out of", player.asteroidLimit,')', "to", player.name
                    player.websocket.send(message)

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
        # send player objects in game instance
        if player.websocket is not None:
            for obj in self.playerObjects:
                message = '{"cmd":"pObjCreate","data":"'
                message += str(obj)
                message += '"}'
                print "sending object", obj['objectId'], "to", player.name
                player.websocket.send(message)

            for color in self.colors:
                if color['player'] is not None:
                    message = '{"cmd":"assignColor","data":"'
                    message += str(color)
                    message += '"}'
                    player.websocket.send(message)
        else:
            print "Cannot synchronize objects with user " + player.name + ". WebSocket is NoneType"

    def synchronizeClientsForObject(self, obj):
        print "synchronizing clients for object", obj['objectId']
        for player in self.players:
            if player.websocket is not None:
                message = '{"cmd":"pObjCreate","data":"'
                message += str(obj)
                message += '"}'
                print "sending object", obj['objectId'], "to", player.name
                player.websocket.send(message)
            else:
                print "Cannot update user " + player.name + " with new object.  Webocket is NoneType"

    def synchronizeObjectRemoval(self, obj):
        message = '{"cmd":"pObjDestroyRequest","data":"'
        message += str(obj)
        message += '"}'

        for player in self.players:
            if player.websocket is not None:
                player.websocket.send(message)
            else:
                print "Cannot update user " + player.name + " with removal of an object.  WebSocket is NoneType"
        
    def addObject(self, object, ownerName=None):
        # adds object to track to OOIs
        self.OOIs.addObject(object,ownerName)

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

    def getPlayerObject(self, uuid):
        """
        gets player object from this instance
        :param uuid: The UUID of the object
        :return: object if found, None if not
        """

        for obj in self.playerObjects:
            if obj['objectId'] == uuid:
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
        