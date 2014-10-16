The qooxdoo sdk is massive (122mb), so I only included our project sources in the UIOverhaul branch. The sub directories are still set up so if anyone wants to run the branch with the SDK, you just merge the qooxdoo-4.0.1-sdk folder into the one that already exists and then the paths will line up. Only then will the branch run for you.

This is just temporary until the UI is done, and then we'll compile a production version of the UI that is a lot less bloated, and will be a lot more responsive



Inline Skeleton - A qooxdoo Application Template
================================================

This is a qooxdoo application skeleton which is used as a template. The 
'create-application.py' script (usually under tool/bin/create-application.py)
will use this and expand it into a self-contained qooxdoo application which 
can then be further extended. Please refer to the script and other documentation
for further information.

short:: is an inline qooxdoo GUI application
copy_file:: tool/data/generator/needs_generation.js source/script/custom.js
