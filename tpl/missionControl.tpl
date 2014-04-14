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
                      
                         
                        </section><!-- /.Left col -->
                        <!-- right col (We are only adding the ID to make the widgets sortable)-->
                        <section class="col-lg">
                            <!-- Map box -->
                            <div class="box box-primary">
                                <div class="box-header">
                                   
                                    

                                    <i class="fa fa-map-marker"></i>
                                    <h3 class="box-title">
                                        Launch Sites
                                    </h3>
                                </div>
                                <div class="box-body no-padding">
                                    <div id="world-map" style="height: 300px"></div>
                                 
                                        
                                    </div>
									
								<div class="box-footer">
                                  <div class="form-group">
                                            <label>Payloads</label>
                                            <select class="form-control">
                                                <option>NEO Detector Satellite</option>
                                                <option>option 2</option>
                                                <option>option 3</option>
                                                <option>option 4</option>
                                                <option>option 5</option>
                                            </select>
                                        </div>
										
										<div class="form-group">
                                            <label>LaunchVehicles</label>
                                            <select class="form-control">
                                                <option>ULA Delta II</option>
                                                <option>SpaceX Falcon Heavy</option>
                                                <option>Soyuz </option>
                                                <option>ESA Ariane 5</option>
                                                <option>JAXA Epsilon</option>
                                            </select>
                                        </div>
										<center> <button class="btn btn-primary btn-lg">Launch!</button> </center>
                                </div>
									
									
                                </div><!-- /.box-body-->

                            </div>
                            <!-- /.box -->

                           
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