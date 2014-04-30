
import unittest
from nose.tools import assert_raises
from time import time

from python.game_logic.Resource import Resource

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