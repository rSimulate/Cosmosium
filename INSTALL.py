"""
Run this python script to set up the cosmosium engine so you can get developing!

NOTE: this is NOT a setup.py script to be used with disutils, and it might not be well tested,
   Please report any and all issues you have with this so we know how to improve this process for new devs.
"""

__author__ = 'rSimulate'

import sys

# check python version
version_info = sys.version_info
if version_info.major <= 2:
    print "\npython version " + sys.version + " is compatible\n"
else:
    raise Exception("Please use Python version 2.* or less")

import platform

if platform.system() == 'Windows':
    PY  = 'C:\Python' + str(version_info.major) + str(version_info.minor) + '\python.exe'
    PIP = 'C:\Python' + str(version_info.major) + str(version_info.minor) + '\Scripts\pip.exe'
elif platform.system() == 'Linux':
    PY  = 'python'
    PIP = 'pip'
elif platform.system() == 'Darwin':
    PY  = 'C:\Python' + str(version_info.major) + str(version_info.minor) + '\python.exe'
    PIP = 'C:\Python' + str(version_info.major) + str(version_info.minor) + '\Scripts\pip.exe'
else:
    raise Exception("The " + platform.system() + " platform is not officially supported at this time")

# TODO: check for pip, else: if windows: d/l and run get_pip.py, elif ubuntu: `apt-get pip`
# install other dependencies using pip

PIP_LIBS = ['GitPython', 'bottle', 'rauth', 'requests', 'pymongo', 'gevent', 'gevent-websocket', 'greenlet',
            'numpy', 'jdcal', 'pycrypto', 'simplejson']

from subprocess import call  # for sys commands

try:
    call([PIP, 'install'] + PIP_LIBS)
except OSError:
    print ("\n\nCan't find pip at " + PIP +
           "\nIs python-pip installed? If (you are on windows and) the error was about vcvarsall.bat, "
           "then you need Visual Studio 2008, "
           "see here for more: "
           "http://stackoverflow.com/questions/3047542/building-lxml-for-python-2-7-on-windows/5122521#5122521\n\n")
    raise

# install/update submodules using GitPython
from os import getcwd, path
from git import Repo

repo = Repo(getcwd())
assert repo.bare is False

print "Installing submodules..."
repo.submodule_update()  # inits and updates all submodules listed in .gitmodules

# create __init__.py in each submodule root directory if there isn't one (fixes bottle import issue)
for module in repo.submodules:
    init_path = path.join(module.abspath, '__init__.py')
    if not path.isfile(init_path):
        open(init_path, 'a').close()

print '\n\nDone! Hopefully all went well and you can run `python app.py` now!'
