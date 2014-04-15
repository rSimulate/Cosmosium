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
                    <!-- this row is fixed to the top... -->
                    <div class="row">
                    <!-- User tech summary -->
                    %include('tpl/tile_overview'
                    %   ,title='Mining Operations Overview'
                    %   ,imgsrc=user.getMineImage()
                    %   ,alt_text='Mining Tech Level '+str(user.research.minerLevel)
                    %   ,data=[dict(val=user.getMinersCount(0),name='Probe')
                    %       ,dict(val=user.getMinersCount(1),name='NEO Redirector')
                    %       ,dict(val=user.getMinersCount(2),name='Main-Belt Hauler')
                    %       ,dict(val=user.getMinersCount(3),name='Reprossessing Barge')
                    %       ,dict(val=user.getMinersCount(4),name='Von Neumann Probe')
                    %   ]
                    %)

                    %include('tpl/tech_overview_tile') # passed implicitly: user 
                    
                    </div?
                </section>
                    
                    <!-- Small boxes (Stat box) -->
                    <div class="row">
                        <div class="col-lg-3 col-xs-6">
                            <!-- small box -->
                            <div class="small-box bg-aqua">
                                <div class="inner">
                                    <h3>
                                        +{{user.getDeltaWealth()}}
                                    </h3>
                                    <p>
                                        Economy Growth
                                    </p>
                                </div>
                                <div class="icon">
                                    <i class="ion ion-bag"></i>
                                </div>
                                <a href="#" class="small-box-footer">
                                    More info <i class="fa fa-arrow-circle-right"></i>
                                </a>
                            </div>
                        </div><!-- ./col -->
                        <div class="col-lg-3 col-xs-6">
                            <!-- small box -->
                            <div class="small-box bg-yellow">
                                <div class="inner">
                                    <h3>
                                        +{{user.getDeltaScience()}}
                                    </h3>
                                    <p>
                                        &#916; Science
                                    </p>
                                </div>
                                <div class="icon">
                                    <i class="ion ion-stats-bars"></i>
                                </div>
                                <a href="#" class="small-box-footer">
                                    More info <i class="fa fa-arrow-circle-right"></i>
                                </a>
                            </div>
                        </div><!-- ./col -->
                        <div class="col-lg-3 col-xs-6">
                            <!-- small box -->
                            <div class="small-box bg-green">
                                <div class="inner">
                                    <h3>
                                        +{{user.getDeltaOrganic()}}
                                    </h3>
                                    <p>
                                        Population Increase
                                    </p>
                                </div>
                                <div class="icon">
                                    <i class="ion ion-person-add"></i>
                                </div>
                                <a href="#" class="small-box-footer">
                                    More info <i class="fa fa-arrow-circle-right"></i>
                                </a>
                            </div>
                        </div><!-- ./col -->
                        <div class="col-lg-3 col-xs-6">
                            <!-- small box -->
                            <div class="small-box bg-red">
                                <div class="inner">
                                    <h3>
                                        +{{user.getDeltaEnergy()}}
                                    </h3>
                                    </h3>
                                    <p>
                                        Energy Balance
                                    </p>
                                </div>
                                <div class="icon">
                                    <i class="ion ion-pie-graph"></i>
                                </div>
                                <a href="#" class="small-box-footer">
                                    More info <i class="fa fa-arrow-circle-right"></i>
                                </a>
                            </div>
                        </div><!-- ./col -->
                    </div><!-- /.row -->

                    <!-- top row -->
                    <div class="row">
                        <div class="col-xs-12 connectedSortable">
                            
                        </div><!-- /.col -->
                    </div>
                    <!-- /.row -->

                    <!-- Main row -->
                    <div class="row">
                        <!-- Left col -->
                        <section class="col-lg-6 connectedSortable"> 
                            

                        </section><!-- /.Left col -->
                        <!-- right col (We are only adding the ID to make the widgets sortable)-->
                        <section class="col-lg-6 connectedSortable">
                            

                        </section><!-- right col -->
                    </div><!-- /.row (main row) -->
                        % include('tpl/tile',s1='col-lg-6', s2='connectedSortable',
                        %           color='bg-navy',
                        %           title="Welcome to Comosium!",
                        %           text="Cosmosium is still a work in progress, so lots of features are missing, but you definitely want to check out the 'Solar System' view to see claimed asteroids, and search for good NEO or main belt 'Targets' through the left-panel navigation. Be sure to check back for more soon!" )

                </section><!-- /.content -->
            </aside><!-- /.right-side -->
        </div><!-- ./wrapper -->


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