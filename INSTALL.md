Step-by-step Intallation Instructions
======
1. clone the repo
    * `git clone https://github.com/rSimulate/Cosmosium.git`
2. install dependencies & a tiny bit of setup
    * `sudo python INSTALL.py`
        * If you are operating on Ubuntu, or any distro of Linux for that matter, make sure you have the 
        python development package installed, called `python-dev` in most repositories.
        * If you run into any issues with gitPython, ensure that you have version `0.3.2.RC1` installed.
        * If you run into any issues with numpy installing, 
        there is a [known issue with pip](https://github.com/pypa/pip/issues/1137). Please install the numpy package
        from a different source, e.g `sudo yum install numpy`.
3. start the server
    * `python app.py` or `./startServer.sh`
        * NOTE: you need sudo to bind port 80
4. open your browser
    * navigate to `localhost:7099` / `127.0.0.1:7099`, or whatever port you have in `app.py`
    * to shutdown the server, a `ctrl+c` should suffice. 
    ### NOTE: There are known WebGL issues a multitude of browsers. We recommend Google Chrome or Firefox for an optimal experience. ###
    

advanced setup
======
1. make the app run forever and start automatically on system boot

  #### ubuntu ####
  * edit `cosmos.conf` so that `chdir` is set to your cosmosium repository folder.
  * `sudo cp cosmos.conf /etc/init/cosmos.conf` | add the .conf for upstart
  * `sudo start cosmos` | new way to start the app
  * `sudo service cosmos` | new way to stop the app
    
