
import unittest
from nose.tools import assert_raises

from ..Resources import Resources, Balance
from ..Resource import Cost

class Resources_test(unittest.TestCase):
    def test_applyBalance(self):
        res = Resources()
        v1 = res.science._value
        b1 = res.science._operationBalance
        dv = -1
        db = 1
        bal = Balance(science=Cost(dv,db))
        res.applyBalance(bal)
        self.assertEqual(v1+dv,res.science._value)
        self.assertEqual(b1+db,res.science._operationBalance)
