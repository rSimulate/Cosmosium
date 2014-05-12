## Step-by-step Intallation Instructions ##
1. clone the repo

  #### using git ####
  `git clone https://github.com/rSimulate/Cosmosium.git`
2. install dependencies
  * `git submodule add https://github.com/defnull/bottle py/lib/bottle`
  * `touch py/lib/bottle/__init__.py`

  #### ubuntu ####
  * `sudo apt-get pip` | install pip package manager
  * `sudo pip install rauth requests pymongo gevent geventwebsocket greenlet` | install needed python packages 
3. `sudo python app.py` or `sudo ./startServer.sh` | start up from within the cosmosium directory
  * NOTE: you only need root to bind port 80, if you've got another port in `app.py`, run w/o `sudo`.
4. open your browser and navigate to `localhost:7099`, or whatever port you have in `app.py`

## advanced setup ##
1. make the app run forever and start automatically on system boot
  #### ubuntu ####
  * edit `cosmos.conf` so that `chdir` is set to your cosmosium repository folder.
  * `sudo cp cosmos.conf /etc/init/cosmos.conf` | add the .conf for upstart
  * `sudo start cosmos` | new way to start the app
  * `sudo service cosmos` | new way to stop the app
    
