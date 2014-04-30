
import unittest

from python.game_logic.UserList import UserList
from python.game_logic.User import User


class UserList_test(unittest.TestCase):
    def test_userInList_if_added(self):
        user_list = UserList()
        test_user = User(name='testUser')
        user_list.addUser(test_user)
        shouldBe_testUser = user_list.getUserByName('testUser')
        self.assertTrue(test_user.name == shouldBe_testUser.name )