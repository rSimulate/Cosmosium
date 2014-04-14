### Step-by-step Intallation Instructions ###
1. clone the repo
  ## using git ##
  `git clone https://github.com/rSimulate/Cosmosium.git`
2. install dependencies
  ## ubuntu ##
  `sudo apt-get pip`
  `pip install rauth requests`
  
3. start up from within the cosmosium directory
  `python app.py`

### advanced setup ###
1. make the app run forever and start automatically on system boot
  ## ubuntu ##
  a. add the .conf for upstart
    `cp cosmosium.conf /etc/init/cosmosium.conf`
  b. new way to start the app:
    `service cosmosium start`
  c. new way to stop the app:
    `service cosmoisum stop`
