<!-- PARAMS:            
    chunks
    messages
    note_count
    task_count
    user
    resources
    pageTitle
        -->


            % include('tpl/head') # implicitly passed: pageTitle
	

  
<!-- top row -->
<div class="row">
    <div class="col-xs-12 connectedSortable">
        
    </div><!-- /.col -->
</div>
<!-- /.row -->

<center>
    <div class="row">
        <!-- Left col -->
      
      
      <script src="jquery.js"></script>
      <script src="jquery-jvectormap-1.0.min.js"></script>
      <script src="jquery-jvectormap-world-mill-en.js"></script>
      
         
        </section><!-- /.Left col -->
        <!-- right col (We are only adding the ID to make the widgets sortable)-->
        <section class="col-lg">
        
            <!-- Map box -->
            <div class="box box-primary">
                
                    
                <label>Available Missions</label>
                    <div class="form-group">
                    
                    
                    
                        <label>Near Earth Asteroid Rendezvous (NEAR)</label>
                        <text>
                            <p>
                            Primary Objective: Return data on the bulk properties, composition, mineralogy, morphology, internal mass distribution and magnetic field of an S-type NEO. 
                            </p> <p>
                            Secondary objectives: Study regolith properties, interactions with the solar wind, possible current activity as indicated by dust or gas, and the asteroid spin state. This data will be used to help understand the characteristics of asteroids in general, their relationship to meteorites and comets, and the conditions in the early solar system. To accomplish these goals, the spacecraft must be equipped with an X-ray/gamma ray spectrometer, a near-infrared imaging spectrograph, a multi-spectral camera fitted with a CCD imaging detector, a laser rangefinder, and a magnetometer. Additionally, a radio science experiment can also be performed using the NEAR tracking system to estimate the gravity field of the asteroid. 
                            </p>
                        </text>
                        <center> <button class="btn btn-primary btn-lg">
                            Accept Mission
                        </button> </center>
                    
                    
                    
                        <label>NEO Asteroid Redirect</label>
                        <text>
                            Send an uncrewed robotic mission to "retrieve" a near-Earth asteroid. The asteroid will be moved into a high lunar orbit or orbit around EML2 (halo orbit, Lissajous orbit) for research and exploration purposes. One of the advantages of a lunar orbit compared with an Earth orbit would be the safety: even at the end of the mission the natural perturbations of the trajectory would cause an eventual impact on the Moon, not on Earth. An Efficient means of solar-electric propulsion (such as solar sails or Hall Effect Ion Drive engines) will be needed. The asteroid can be grabbed physically to "directly" move it, or a gravity tractor approach can be used.
                        </text>

                        <center> <button class="btn btn-primary btn-lg">
                            Accept Mission
                        </button> </center>
                        
                        <label>Rendezvous with Captured NEO</label>
                        <text>
                            Once an asteroid is in the desired orbit, at least one crewed mission must rendezvous with it to collect and return samples. 
                        </text>

                        <center> <button class="btn btn-primary btn-lg">
                            Accept Mission
                        </button> </center>
                    </div>


            </div><!-- /.box-body-->
        </div><!-- /.box -->

           
        </section><!-- right col -->
    </div><!-- /.row (main row) -->				
</center>

                
%include('tpl/foot')                