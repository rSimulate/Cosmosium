
import unittest

from py.game_logic.UserList import UserList
from py.game_logic.User import User


class UserList_test(unittest.TestCase):
    def test_userInList_if_added(self):
        user_list = UserList()
        test_user = User(name='testUser')
        fake_access_token = 'fake-token-1234'
        user_list.addUser(test_user,fake_access_token)
        shouldBe_testUser = user_list.getUserByName('testUser')
        self.assertTrue(test_user is shouldBe_testUser )
        
    def test_addTokenToExistingUser_linksTo_existingUserObj(self):
        # checks that the existing object and the object reference through the new link are the same
        user_list = UserList()
        fake_access_token = 'fake-token-1111'
        user_list.addUser(User(name='testUser'),fake_access_token)
        # test_user is now in the UserList
        new_access_token = 'fake-token-2222'
        user_list.addUser(User(name='testUser'),new_access_token)
        # now token 1 and 2 should both ref the same obj
        u1 = user_list.getUserByToken(fake_access_token)
        u2 = user_list.getUserByToken(new_access_token)
        self.assertTrue(u1 is u2)
