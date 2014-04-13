#!/usr/bin/python2.7
# -*- coding: utf-8 -*-

"""config.py: Default configuration."""

# Server:
SERVER = 'wsgiref'
HOST = 'localhost'
PORT = 7099

# Meta:
# Note on making it work in localhost:
# * Open a terminal, then do:
#   - sudo gedit /etc/hosts
# * Enter the desired localhost alias for 127.0.0.1:
#   - (e.g. 127.0.0.1 mydomain.tld)
# * Don't forget to save the file :)
BASE_URI = 'http://mydomain.tld'
GOOGLE_BASE_URI = 'http://localhost' # Google doesn't seem to accept
                                     # non-working urls, but accepts localhost

# Facebook:
FACEBOOK_CLIENT_ID = '545723862164937'
FACEBOOK_CLIENT_SECRET = '5407608c6e9d10b297ba77a4de18f75f'

# Twitter:
TWITTER_CLIENT_ID = '07gvoVMGyyul4m5bKkJuOA'
TWITTER_CLIENT_SECRET = 'PUOGZog1IhxsOQVojrwVgjHgSlHaVRibcpVsP8Axk0'

# Google:
GOOGLE_CLIENT_ID = '954851881468.apps.googleusercontent.com'
GOOGLE_CLIENT_SECRET = 'HTvpTPPUGQfWByCaonsC4EMa'