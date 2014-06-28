                </section><!-- /.content -->
            </aside><!-- /.right-side -->
            
        % if config.showFrame:
            <!-- jQuery 2.0.2 -->
            <script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min.js"></script>
            <!-- jQuery UI 1.10.3 -->
            <script src="http://code.jquery.com/ui/1.10.4/jquery-ui.min.js" type="text/javascript"></script>
            <!-- Bootstrap -->
            <script src="//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js" type="text/javascript"></script>
            <!-- Morris.js charts -->
            <!--
            <script src="//cdnjs.cloudflare.com/ajax/libs/raphael/2.1.0/raphael-min.js"></script>
            <script src="js/plugins/morris/morris.min.js" type="text/javascript"></script>
            -->
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
            <!--
            <script src="js/AdminLTE/dashboard.js" type="text/javascript"></script>     
            -->
            
            <!-- for toggling music play -->
            <script src="js/bg_music_toggle.js" type="text/javascript"></script>
            
            <!-- for updating the resource display -->
            <script src="/resourceUpdate.js" type="text/javascript" onload="setInterval(updateAll,1000)"></script>
            
           <!-- for updating the game time display -->
            <script src="/js/timeUpdater.js" type="text/javascript" onload="setInterval(uTime,{{user.game.getDeltaYearUpdate()}}000)"></script>
            
            <!-- for j-query based navigation -->
            <script src="/js/game_frame_nav.js" type="text/javascript"></script>

            <script type="text/javascript" src='/webSocketSetup.js' </script>   

            
        % end
    </body>
</html>