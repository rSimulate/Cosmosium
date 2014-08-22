<!DOCTYPE html>
<html>
<script type="application/javascript">

</script>
<script type='text/javascript' src='/tpl/js/player.js'></script>


<head>
<meta charset="UTF-8">
<title>Cosmosium | {{pageTitle}}</title>

<!-- Suppress Favicon -->
<link href="data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABmJLR0T///////8JWPfcAAAACXBIWXMAAABIAAAASABGyWs+AAACbUlEQVRIx7WUsU/qUBTGv96WSlWeEBZijJggxrREdwYixMnByYEyOvgfsBAMG0xuDsZ/QGc3NDFhgTioiYsmkhBYGLSBkLYR0va8gSjvQXiIT7/l5ibfOd/v3pN7gSmVSMTj8ThRfzdYk8lkMpl83/+AVFVVVXU0eHiVJEmSpB8DIcpkMplsdhCYz+fzhQJROBwOh8PDQN+oQCAQCASIRFEURZHI45GkP0/e7Xa73e70AMJnjel0Op1OA6oaDB4eAkAw6PcDvZ5t6zrw/Hx2trAw/cHYZ426ruu6DtzcGEYuBzQa19etFvD4WKtls4AoRqMPDwBjjLGPrt84ilgsFovF6EOapmmaRiP6O/jbAIguL4vFYpHGqlKpVCoVomq1Wq1Wibxer9fn+w+Q9+cUiUQikQhNrfdgWZZlWf4yyGhj27Zt254MUK/X6/X6F0aiKIqiKIOCYRmGYRjGZADLsizLIgqFQqHV1SkAnp5OTn79ItK0qyuPZ7SxaZqmaU4GKJfPzxmbfAPc/f3pqaIQLS8vLtZqgOP0bYyJoiAARC5Xrwf4/Vtbb2+Th1YqlUqlErC01GgkEkCz2WxyHLC+LsuiCAiCJLlcgM+3vd3pcBzXaJTLR0dEs7Ptdv+D4TiOG/A6DsBxQKvV621sAGtru7vl8ngAjuvXv7xcXIgiwNjMjCj2h+k4fQfPA4LA8xwHCO323V2hABiG223bwPy8xwMAbvfcHGMAY32j47y+3t4OAsZpZ2dzEwAsy7IcBxAExhwHMIxOx3GAlZVUyjT/1WFIudzenstFlEpFo9M8o+Pj/X2eJzo4SCR4fnzdb2N4Pyv9cduVAAAAAElFTkSuQmCC" rel="icon" type="image/x-icon" />

% if config.showFrame:
<meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' name='viewport'>
<!-- bootstrap 3.0.2 -->
<link href="http://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
<!-- font Awesome -->
<link href="http://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.1.0/css/font-awesome.css" rel="stylesheet" type="text/css" />
<!-- Ionicons -->
<link href="http://cdn.jsdelivr.net/ionicons/1.4.1/css/ionicons.min.css" rel="stylesheet" type=" text/css" />
<!-- Morris chart -->
<link href="css/morris/morris.css" rel="stylesheet" type="text/css" />
<!-- jvectormap -->
<link href="css/jvectormap/jquery-jvectormap-1.2.2.css" rel="stylesheet" type="text/css" />
<!-- Daterange picker -->
<link href="css/daterangepicker/daterangepicker-bs3.css" rel="stylesheet" type="text/css" />
<!-- fullCalendar -->
<link href="http://cdnjs.cloudflare.com/ajax/libs/fullcalendar/2.0.3/fullcalendar.css" rel="stylesheet" type="text/css" />
<!-- bootstrap wysihtml5 - text editor -->
<link href="http://cdn.jsdelivr.net/bootstrap.wysihtml5/0.0.2/bootstrap-wysihtml5-0.0.2.css" rel="stylesheet" type="text/css" />
<!-- Theme style -->
<link href="css/AdminLTE.css" rel="stylesheet" type="text/css" />

<!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
<!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
<!--[if lt IE 9]>
<script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
<script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
<![endif]-->
% end

% chunks.bg_music.loadRand()
<script type='text/javascript'>var audioAttrib = "{{chunks.bg_music.attrib}}"</script>
<audio id="background_audio"
% if config.music:
autoplay="true">
% else:
autoplay="false">
% end
<source src="{{chunks.bg_music.link}}" />
</audio>


<!-- websocket connection -->
<script type='text/javascript' src='/js/objectDB.js'></script>
<script type='text/javascript' src='/js/wsMessageParser.js'></script>
<script type='text/javascript' src='/js/createMessage.js'></script>


<style>
    html,body { height: 100%; margin: 0; padding: 0; overflow: hidden;}
    #info {
        color:#000;
        position: absolute;
        top: 0px; width: 100%;
        padding: 5px;
    }

    a {
        color: red;
    }

    #claim-asteroid-button {
        color: red;
    }

    .sidebar-index {
        display: inline;
        z-index: 1020;
    }

    #dash {
        display: none;
        z-index: 1010;
        position: absolute;
        top: 20%;
    }

    .row {
        margin-left: -7px;
    }

    #welcome {
        padding: 0 15px;
    }

    #launchpad {
        display: none;
        position: absolute;
        top: 20%;
        left: 23%;
        width: 40%;
        height: 60%;
        z-index: 1010;
    }

    #missionControl {
        display: none;
        position: absolute;
        top: 20%;
        left: 23%;
        width: 40%;
        height: 60%;
        z-index: 1010;
    }

    #observatories {
        display: none;
        position: absolute;
        top: 23%;
        left: 32%;
        width: 40%;
        height: 60%;
        z-index: 1010;
    }

    #timeline {
        display: none;
        position: absolute;
        top: 7%;
        left: 17%;
        width: 70%;
        height: 80%;
        z-index: 1010;
    }

    #asteroidSurveys {
        display: none;
        position: absolute;
        top: 12%;
        left: 17%;
        width: 70%;
        height: 80%;
        z-index: 1010;
        overflow: hidden;
        overflow-y: auto;
    }

    #surveyEquip {
        display: none;
        position: absolute;
        top: 20%;
        left: 23%;
        width: 40%;
        height: 60%;
        z-index: 1010;
    }

    #research {
        display: none;
        position: absolute;
        top: 12%;
        left: 17%;
        width: 70%;
        height: 80%;
        z-index: 1010;
        overflow: hidden;
        overflow-y: auto;
    }

    #resource-bar {
        display: inline;
        z-index: 1010;
        position: absolute;
        right: 40%;
        background-color: transparent;
    }

    .content-header {
        display: inline;
        z-index: 1010;
        position: absolute;
        right: 35%;
    }

    #body-info-container {
        background-color: gray;
        color: white;
        position: absolute;
        top: 70px;
        right: 0px;
        width: 200px;
        padding: 5px;
        display: none;
        z-index: 1010;
    }

    #body-info {
        font-family:Monospace;
        font-size:13px;
        text-align:center;
        font-weight: bold;

        margin: 0px;
        overflow: hidden;
    }

    #canvas {
        display: inline;
        z-index: 1000;
        position: absolute;
    }
</style>
</head>
<body style='background-color: black'>
<!-- top navigation bar -->
% include('tpl/page_chunks/frame_top')

<!-- left navigation bars -->
% include('tpl/page_chunks/frame_left')


<!-- Right side column. Contains the navbar and content of the page -->
<aside class="right-side" style="background-color: transparent">


    <!-- webGL Content -->
    % include('tpl/page_chunks/webGL_shaders')
    <div id="canvas">
        <!-- Page Header and Resource Bar -->
        <div id="resource-bar" class="content-header skin-black" >
            % include('tpl/page_chunks/resourcebar')
        </div>
        <!-- Dash -->
        % include('tpl/content/dash')

        <!-- Mission Control -->
        % include('tpl/content/missionControl')

        <!-- Launchpad -->
        % include('tpl/content/launchpad')

        <!-- Observatories -->
        % include('tpl/content/observatories')

        <!-- Timeline -->
        % include('tpl/content/timeline')

        <!-- Asteroid Surveys -->
        % include('tpl/content/asteroidSurveys')

        <!-- Survey Equipment -->
        % include('tpl/content/surveyEquipment')

        <!-- Space Industry -->
        % include('tpl/content/research')

        <!-- Human Habitation -->
        <!-- Robotics & AI -->
        <!-- Launch Systems -->
        <!-- Resource Market -->
        <!-- Fuel Network -->
        <!-- Space Tourism -->
        <!-- Outreach -->
        <!-- Government -->
        <!-- Organization -->

        <!-- object details pane -->
        % include('tpl/page_chunks/body-info')

    </div>
    % include('tpl/page_chunks/webGL_js')
</aside><!-- /.right-side -->


<!-- bottom/draggable expander menu -->
% include('tpl/page_chunks/UI_ferro.tpl')


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
<!-- daterangepicker -->
<script src="http://cdn.jsdelivr.net/bootstrap.daterangepicker/1.3.5/daterangepicker.js" type="text/javascript"></script>
<!-- Sparkline -->
<script src="http://cdnjs.cloudflare.com/ajax/libs/jquery-sparklines/2.1.2/jquery.sparkline.min.js" type="text/javascript"></script>
<!-- Moment (fullCalendar dependency) -->
<script src="http://cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.1/moment.min.js" type="text/javascript"></script>
<!-- fullCalendar -->
<script src="http://cdnjs.cloudflare.com/ajax/libs/fullcalendar/2.0.3/fullcalendar.min.js" type="text/javascript"></script>
<!-- jQuery Knob Chart -->
<script src="http://cdn.jsdelivr.net/jquery.knob/1.2.9/jquery.knob.min.js" type="text/javascript"></script>
<!-- WYSIHTML5 -->
<script src="http://cdnjs.cloudflare.com/ajax/libs/wysihtml5/0.3.0/wysihtml5.min.js" type="text/javascript"></script>
<!-- iCheck -->
<script src="http://cdnjs.cloudflare.com/ajax/libs/iCheck/1.0.1/icheck.min.js" type="text/javascript"></script>

<!-- AdminLTE App -->
<script src="js/AdminLTE/app.js" type="text/javascript"></script>

<!-- AdminLTE dashboard demo (This is only for demo purposes) -->
<!--
<script src="js/AdminLTE/dashboard.js" type="text/javascript"></script>
-->

<!-- for toggling music play -->
<script src="js/bg_music_toggle.js" type="text/javascript"></script>

<!-- for updating the resource display -->
<script src="/tpl/js/resourceUpdate.js" type="text/javascript" onload="setInterval(updateAll,1000)"></script>

<!-- jvectormap -->
<script src="js/plugins/jvectormap/jquery-jvectormap-1.2.2.min.js" type="text/javascript"></script>
<script src="js/plugins/jvectormap/jquery-jvectormap-world-mill-en.js" type="text/javascript"></script>

<!-- cryptoJS for login hash -->
<script src="http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/sha256.js"  type="text/javascript"></script>

<!-- for j-query based navigation -->
<script src="/js/game_frame_nav.js" type="text/javascript"></script>
<script src="/js/nav_asteroidSurveys.js" type="text/javascript"></script>

<!-- for j-query based navigation -->
<script src="/js/vendor/ferro/.js" type="text/javascript"></script>

<!-- WEBSOCKETS !IMPORTANT! -->
<script type="text/javascript" src='/tpl/js/webSocketSetup.js'></script>
</body>
</html>