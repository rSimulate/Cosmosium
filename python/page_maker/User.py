
class Resources(object):
    def __init__(self):
        self.science = 1234
        self.wealth = 56
        self.energy = 7
        self.metals = 0
        self.life   = 7

class User(object):
    def __init__(self):
        self.name = 'Johannes Kepler'
        self.icon = "img/avatar3.png"
        self.agency = 'NASA'
        self.subtext = 'forger of worlds'
        self.profile_link = '#'
        
        self.history_text = "Game History"
        self.history_link = "#"
        self.stats_text = "Stats"
        self.stats_link = "#"
        self.thing3_text = "More"
        self.thing3_link = "#"
        
        self.resources = Resources()