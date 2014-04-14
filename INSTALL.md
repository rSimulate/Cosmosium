## Step-by-step Intallation Instructions ##
1. clone the repo

  #### using git ####
  `git clone https://github.com/rSimulate/Cosmosium.git`
2. install dependencies

  #### ubuntu ####
  * `sudo apt-get pip` | install pip 
  * `pip install rauth requests` | install python packages rauth and requests 
3. `python app.py` | start up from within the cosmosium directory
  

## advanced setup ##
1. make the app run forever and start automatically on system boot

  #### ubuntu ####
  * `cp cosmosium.conf /etc/init/cosmosium.conf` | add the .conf for upstart
  * `service cosmosium start` | new way to start the app
  * `service cosmoisum stop` | new way to stop the app
    
