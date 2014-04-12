
import unittest
import getAsteroid as getA

class basic_tests(unittest.TestCase):
    def test_webExample(self):
        # test out the example given on http://www.asterank.com/mpc
        resp = getA.asterankAPI('{"e":{"$lt":0.1},"i":{"$lt":4},"a":{"$lt":1.5}}',2)
        expectedResp = '''[
{
  "rms":0.52,
  "epoch":"K134I",
  "readable_des":"(138911) 2001 AE2",
  "H":19.1,
  "num_obs":366,
  "ref":"MPO229693",
  "G":0.15,
  "last_obs":"20120417",
  "comp":"MPCLINUX  ",
  "M":199.38482,
  "U":" ",
  "e":0.0816832,
  "a":1.3496897,
  "om":171.48693,
  "pert_p":"38h",
  "d":0.62856933,
  "i":1.66115,
  "des":"D8911",
  "flags":"0804",
  "num_opp":8,
  "w":43.09756,
  "pert_c":"M-v"
},
{
  "rms":0.5,
  "epoch":"K134I",
  "readable_des":"(163000) 2001 SW169",
  "H":19.0,
  "num_obs":429,
  "ref":"MPO232154",
  "G":0.15,
  "last_obs":"20120506",
  "comp":"MPCLINUX  ",
  "M":157.71014,
  "U":" ",
  "e":0.0515752,
  "a":1.2484544,
  "om":8.4609,
  "pert_p":"38h",
  "d":0.70655345,
  "i":3.55425,
  "des":"G3000",
  "flags":"0804",
  "num_opp":5,
  "w":284.78542,
  "pert_c":"M-v"
}
]'''
        self.assertTrue(resp,expectedResp)