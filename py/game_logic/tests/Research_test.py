import unittest

from py.game_logic.Research import Research

class Research_test(unittest.TestCase):
    def test_add_and_check_researched_nodes(self):
        res = Research()
        node= 'advanced spam canning'
        self.assertFalse(res.isUnlocked(node))
        
        res.unlock(node)
        self.assertTrue(res.isUnlocked(node))
