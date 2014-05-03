
import unittest

from .. import purchases

class purchases_test(unittest.TestCase):
    def test_getCost_returns_correctValue(self):
        self.assertTrue(purchases.getCost('asteroidTrack')['science'] == purchases.baseCostMap['asteroidTrack']['science'])
        