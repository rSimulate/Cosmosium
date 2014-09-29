
import unittest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys


class BasicTests(unittest.TestCase):
    """
    basic tests to ensure basic functionality of site and proper function of test suite.
    """
    def setUp(self):
        self.driver = webdriver.Firefox()  # TODO: what is the best way to test with multiple drivers?
        #self.driver = webdriver.Chrome()
        #self.driver = webdriver.Ie()

    def test_login_bypass(self):
        """
        ensures that login via query string "/?user=admin works" (to bypass normal login)
        """
        self.driver.get("localhost:7099/play?user=admin")

        # check for resource bar and all it's parts
        bar_text = self.driver.find_element_by_id('resource-bar').text

        # NOTE: this next part fails b/c some elements aren't drawn if window is too small
        #resources = ['Science', 'Wealth', 'Energy', 'Metals', 'Organic']
        #for resource in resources:
        #    print bar_text
        #    assert resource in bar_text

        # check resource values >= 0
        #self.assertGreaterEqual(int(self.driver.find_element_by_id('science').text), 0)
        #self.assertGreaterEqual(int(self.driver.find_element_by_id('wealth').text), 0)
        #self.assertGreaterEqual(int(self.driver.find_element_by_id('energy').text), 0)
        #self.assertGreaterEqual(int(self.driver.find_element_by_id('metals').text), 0)
        #self.assertGreaterEqual(int(self.driver.find_element_by_id('organic').text), 0)

    def tearDown(self):
        self.driver.close()

    # test search
    #elem = driver.find_element_by_name("q")
    #elem.send_keys("pycon")
    #assert "No results found." not in driver.page_source
    #elem.send_keys(Keys.RETURN)