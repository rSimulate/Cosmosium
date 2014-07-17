__author__ = '7yl4r'

class Query(object):
    def __init__(self, baseQ):
        # inits Query object using base query (which may have missing values)
        self.group = baseQ.group
        self.limit = baseQ.limit
        self.qStr  = baseQ.query
        self.query = eval(self.qStr)
        # TODO ensure self.query has all expected values

    def conditionToUser(self, use):
        # alters the query based on given user researches
        raise NotImplementedError('not yet coded: conditionToUser')