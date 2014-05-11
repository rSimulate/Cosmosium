
import unittest

from py.game_logic.user.User import User

from py.game_logic.eco.Resources import Balance
from py.game_logic.eco.Resource import Cost

class User_test(unittest.TestCase):
    def test_deltaResourcesGoesUp_if_researchAgeIncreases(self):
        user = User()
        # TODO!!!
        
    def test_userCannotAffordValue_returns_false(self):
        user = User()
        bal = Balance(science=Cost(-10,0))
        assert(user.resources.science._value+bal.science.oneTime<=0)
        self.assertFalse(user.purchase(balance=bal))
        
    def test_userCanAffordValue_returns_true(self):
        user = User()
        user.resources.science._value = 100
        bal = Balance(science=Cost(-10,0))
        val = user.resources.science._value
        print val
        self.assertTrue(user.purchase(balance=bal))
        
    def test_userPurchaseDeductsBalance(self):
        user = User()
        user.resources.science._value = 100
        bal = Balance(science=Cost(-10,0))
        val = user.resources.science._value
        user.purchase(balance=bal)
        self.assertEqual(val,90)