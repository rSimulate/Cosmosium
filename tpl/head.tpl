<!DOCTYPE html>
<html>

<!-- use the webGL scene as bg -->
% if config.showBG:
    <div style="position: absolute; left: 0px; top: 0px background-color: green;" id='systemBG'>
        % include('tpl/webGL_scene',asteroidDB='db/test_asteroids.js')
    </div>
# end
    
    <head>
        <meta charset="UTF-8">
        <title>Cosmosium | {{pageTitle}}</title>        
        % if config.showFrame:
            <meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' name='viewport'>
            <!-- bootstrap 3.0.2 -->
            <link href="css/bootstrap.min.css" rel="stylesheet" type="text/css" />
            <!-- font Awesome -->
            <link href="css/font-awesome.min.css" rel="stylesheet" type="text/css" />
            <!-- Ionicons -->
            <link href="css/ionicons.min.css" rel="stylesheet" type=" text/css" />
            <!-- Morris chart -->
            <link href="css/morris/morris.css" rel="stylesheet" type="text/css" />
            <!-- jvectormap -->
            <link href="css/jvectormap/jquery-jvectormap-1.2.2.css" rel="stylesheet" type="text/css" />
            <!-- fullCalendar -->
            <link href="css/fullcalendar/fullcalendar.css" rel="stylesheet" type="text/css" />
            <!-- Daterange picker -->
            <link href="css/daterangepicker/daterangepicker-bs3.css" rel="stylesheet" type="text/css" />
            <!-- bootstrap wysihtml5 - text editor -->
            <link href="css/bootstrap-wysihtml5/bootstrap3-wysihtml5.min.css" rel="stylesheet" type="text/css" />
            <!-- Theme style -->
            <link href="css/AdminLTE.css" rel="stylesheet" type="text/css" />

            <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
            <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
            <!--[if lt IE 9]>
              <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
              <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
            <![endif]-->
        % end
        
            <!-- background music -->
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


    </head>
    <body class="skin-black">
        <!-- navigation bars -->
        % if config.showFrame:
        %   include('tpl/game_frame') # implicitly passed: chunks,messages,note_count,task_count,user,resources
        % end
        
        <!-- Right side column. Contains the navbar and content of the page -->
        <aside class="right-side">
            <!-- Page Header and Resource Bar -->
            % if config.showResources:
            %   include('tpl/resourcebar') # implicitly passed: Chunks.appName, PageTitle
            % end
            <!-- Main content -->
            <section class="content" id="content">