
import unittest

from python.game_logic.User import User

class User_test(unittest.TestCase):
    def test_deltaResourcesGoesUp_if_researchAgeIncreases(self):
        user = User()
        # TODO!!!