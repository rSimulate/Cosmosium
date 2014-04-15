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

                <div class="col-xs-5 text-center" >
                <img src="img/404/404.png" alt=""/>
                <!-- image from lockerz.com/ labeled for non-commercial re-use by James Manning (http://www.smh.com.au/digital-life/digital-life-news/an-error-message-with-a-twist-20120424-1xi05.html) -->
                </div>
                

                </section><!-- /.content -->
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