## Step-by-step Intallation Instructions ##
1. clone the repo
  `git clone https://github.com/rSimulate/Cosmosium.git`
2. install dependencies & a tiny bit of setup
  `python INSTALL.py`
3. start the server
  `python app.py` or `./startServer.sh`
  * NOTE: you need sudo to bind port 80
4. open your browser and navigate to `localhost:7099`, or whatever port you have in `app.py`

## advanced setup ##
1. make the app run forever and start automatically on system boot
  #### ubuntu ####
  * edit `cosmos.conf` so that `chdir` is set to your cosmosium repository folder.
  * `sudo cp cosmos.conf /etc/init/cosmos.conf` | add the .conf for upstart
  * `sudo start cosmos` | new way to start the app
  * `sudo service cosmos` | new way to stop the app
    
