#!/usr/bin/python2.7
# -*- coding: utf-8 -*-

"""config.py: Default configuration."""

# Server:
SERVER = 'wsgiref'
DOMAIN = 'localhost:7099'
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
FACEBOOK_CLIENT_ID = 'NULL'
FACEBOOK_CLIENT_SECRET = 'NULL'

# Twitter:
TWITTER_CLIENT_ID = 'NULL'
TWITTER_CLIENT_SECRET = 'NULL'

# Google:
GOOGLE_CLIENT_ID = 'NULL'
GOOGLE_CLIENT_SECRET = 'NULL'
