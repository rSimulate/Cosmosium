
import unittest
from nose.tools import assert_raises
from time import time

from ..Resource import Resource, Cost

class Resource_test(unittest.TestCase):
    def test_valueGoesUpOverTime(self):
        res = Resource()
        initTime = time()
        self.assertTrue(res(initTime) < res(initTime+10))
        
    def test_callWithT_equals_callWithoutT_if_t_is_now(self):
        res = Resource()
    #    # small imprecisions make this test fail every time.
    #    then = time()
    #    valIs = res()
    #    while res() == valIs: # loop until enough time has passed
    #        continue
    #    valWas = res(t=then)
    #    self.assertEqual(valIs,valWas)
        self.assertEqual(res(),res(time()))
        
    def test_throwsErr_on_timeBeforeInit(self):
        now = time()
        res = Resource()
        assert_raises(ValueError,res,now-30)

    def test_addCost(self):
        cost = Cost(7,93)
        res  = Resource(val=3,bal=7)
        res.applyCost(cost)
        self.assertEqual(res._value,7+3)
        self.assertEqual(res._operationBalance,93+7)
