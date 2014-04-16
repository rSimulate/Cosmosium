<!-- PARAMS:            
    chunks
    messages
    note_count
    task_count
    user
    resources
    pageTitle
        -->

<!DOCTYPE html>
<html>
    <body class="skin-black">
            % include('tpl/head') # implicitly passed: pageTitle
			
            % include('tpl/game_frame') # implicitly passed: chunks,messages,note_count,task_count,user,resources
            
            <!-- Right side column. Contains the navbar and content of the page -->
            <aside class="right-side">

            <!-- Page Header and Resource Bar -->
			% include('tpl/resourcebar') # implicitly passed: Chunks.appName, PageTitle

                <!-- Main content -->
                <section class="content">

  
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

                </section><!-- /.content -->
				
				</center>
            </aside><!-- /.right-side -->
        </div><!-- ./wrapper -->

        <!-- add new calendar event modal -->


        <!-- jQuery 2.0.2 -->
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min.js"></script>
        <!-- jQuery UI 1.10.3 -->
        <script src="js/jquery-ui-1.10.3.min.js" type="text/javascript"></script>
        <!-- Bootstrap -->
        <script src="js/bootstrap.min.js" type="text/javascript"></script>
        <!-- Morris.js charts -->
        <script src="//cdnjs.cloudflare.com/ajax/libs/raphael/2.1.0/raphael-min.js"></script>
        <script src="js/plugins/morris/morris.min.js" type="text/javascript"></script>
        <!-- Sparkline -->
        <script src="js/plugins/sparkline/jquery.sparkline.min.js" type="text/javascript"></script>
        <!-- jvectormap -->
        <script src="js/plugins/jvectormap/jquery-jvectormap-1.2.2.min.js" type="text/javascript"></script>
        <script src="js/plugins/jvectormap/jquery-jvectormap-world-mill-en.js" type="text/javascript"></script>
        <!-- fullCalendar -->
        <script src="js/plugins/fullcalendar/fullcalendar.min.js" type="text/javascript"></script>
        <!-- jQuery Knob Chart -->
        <script src="js/plugins/jqueryKnob/jquery.knob.js" type="text/javascript"></script>
        <!-- daterangepicker -->
        <script src="js/plugins/daterangepicker/daterangepicker.js" type="text/javascript"></script>
        <!-- Bootstrap WYSIHTML5 -->
        <script src="js/plugins/bootstrap-wysihtml5/bootstrap3-wysihtml5.all.min.js" type="text/javascript"></script>
        <!-- iCheck -->
        <script src="js/plugins/iCheck/icheck.min.js" type="text/javascript"></script>

        <!-- AdminLTE App -->
        <script src="js/AdminLTE/app.js" type="text/javascript"></script>
        
        <!-- AdminLTE dashboard demo (This is only for demo purposes) -->
        <script src="js/AdminLTE/dashboard.js" type="text/javascript"></script>        

    </body>
</html>