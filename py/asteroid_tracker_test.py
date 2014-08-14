__author__ = '7yl4r'


import unittest

from py.game_logic.user.User import User
from py.game_logic.Game import Game
from py.game_logic.eco.Resources import Balance
from py.game_logic.eco.Resource import Cost

import py.asteroid_tracker as tracker


class AsteroidTrackerTest(unittest.TestCase):
    def test_track_several_asteroids_with_lots_of_funds_is_success(self):
        user = User('test user')
        user.setGame(Game())

        LARGE_NUMBER = 1000000000
        # make user rich!
        user.resources.applyBalance(Balance(Cost(LARGE_NUMBER), Cost(LARGE_NUMBER), Cost(LARGE_NUMBER), Cost(LARGE_NUMBER), Cost(LARGE_NUMBER)))

        fake_asteroid = "{'orbitName':'test_orbitName', 'objectId':'test_objectID'}"

        n_tests = 5
        for i in range(n_tests):
            self.assertEqual(tracker.asteroid_track_request_responder(fake_asteroid, user), tracker.RESPONSE_SUCCESS)