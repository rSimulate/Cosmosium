## Step-by-step Intallation Instructions ##
1. clone the repo

  #### using git ####
  `git clone https://github.com/rSimulate/Cosmosium.git`
2. install dependencies

  #### ubuntu ####
  * `sudo apt-get pip` | install pip 
  * `pip install rauth requests` | install python packages rauth and requests 
3. `python app.py` | start up from within the cosmosium directory
  * NOTE: you need root to bind port 80, so you might need to `sudo python app.py`.
  

## advanced setup ##
1. make the app run forever and start automatically on system boot

  #### ubuntu ####
  * `cp cosmos.conf /etc/init/cosmos.conf` | add the .conf for upstart
  * `sudo start cosmos` | new way to start the app
  * `sudo service cosmos` | new way to stop the app
    
