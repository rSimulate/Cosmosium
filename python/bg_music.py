'''
bg music class used for generating links & info for ambient, space-y bg tracks
'''

import random

def genAttr(author,title):
    # generate attribution text using given author and track strings
    return title+' by '+author

tracks = [dict(link='http://storage-new.newjamendo.com/download/track/128345/mp32/',
            attrib=genAttr('Doc','Bell Meditiation')),
            dict(link='http://storage-new.newjamendo.com/download/track/878540/mp32/',
            attrib=genAttr('Louigi Verona','ritual')),
            dict(link='http://storage-new.newjamendo.com/download/track/213140/mp32/',
            attrib=genAttr('Shane Carey','In Space, Nobody Can Hear You Dream'))
            ]


class bg_music(object):
    def __init__(self):
        self.link = '#' # link to audio
        self.attrib = '' # attribution text
        
    def loadRand(self):
        # loads another random track
        track = random.choice(tracks)
        self.link = track['link']
        self.attrib = track['attrib']