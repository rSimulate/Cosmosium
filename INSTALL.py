'''
Run this python script to set up the cosmosium engine so you can get developing!

NOTE: this is NOT a setup.py script to be used with disutils, and it might not be well tested,
   Please report any and all issues you have with this so we know how to improve this process for new devs.
'''

__author__ = 'rSimulate'

# TODO: check python version is 2.*, not 3+

# these are the commands you'd use in your cmd line,
#  if different on your sys (ie to use python you type C:\Python27\python.exe, change them)
PY  = '\c\Python27\python.exe'
GIT = 'git'
PIP = 'pip'

SUBMODULES = {
    # loc_in_dir   : repo_url
    './py/lib/bottle': 'https://github.com/defnull/bottle'
}

PIP_LIBS = ['rauth', 'requests', 'pymongo', 'gevent', 'gevent-websocket', 'greenlet']

from subprocess import call  # for sys commands

# TODO: check for git, else slap user in face

# install submodules using git
# TODO: this is the WRONG way to do it. see following comments for the RIGHT way (that doesn't work).
for sub in SUBMODULES:
    print '\ninstalling submodule @ ', sub, '...'
    call([GIT, 'submodule', 'add', SUBMODULES[sub], sub])
# call([GIT, 'submodule', 'init'])
# call([GIT, 'submodule', 'update'])

# TODO: tweak submodules so we can use them
print 'tweaking submodules for our usage... '
call(['touch', 'py/lib/bottle/__init__.py'])
try:
    call('rm -r py/lib/bottle/test')
    call('rm -r py/lib/bottle/docs')
except OSError:
    print "bottle test & docs not found so I'm not deleting them."

# TODO: check for pip, else: if windows: d/l and run get_pip.py, elif ubuntu: `apt-get pip`

# install other dependencies using pip
call([PIP, 'install'] + PIP_LIBS)
# TODO: catch that annoying vcvarsall.bat issue from pip on windows and direct user here: http://stackoverflow.com/a/10558328/1483986

print '\n\nDone! Hopefully all went well and you can run `python app.py` now!'
