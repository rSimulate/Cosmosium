<!-- header logo: style can be found in header.less -->
<header class="header" style="position: absolute; left: 0px; top: 0px">
    <!-- TODO: new logo -->
    <a href="/" class="logo">
        <!-- Add the class icon to your logo image or logo icon to add the margining -->
        COSMOSIUM
    </a>
    <!-- Header Navbar: style can be found in header.less -->
    <nav class="navbar navbar-static-top" role="navigation">
        <!-- Sidebar toggle button-->
        <a href="#" class="navbar-btn sidebar-toggle" data-toggle="offcanvas" role="button">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
        </a>
        <ul class="nav navbar-nav">
            <li><a href='#' id="gametime">{{user.game.time()}}</a></li>
		</ul>
        <div class="navbar-right">
            <ul class="nav navbar-nav">
                <li>
                    <!-- background music toggle -->
                    <a href="#muteMusic" id="musicMute">
                        <i class="fa fa-music" id="musicAttribution"></i>  
                            % if config.music: 
                                {{chunks.bg_music.attrib}}
                            % else:
                                muted
                            % end
                    </a>
                </li>
            
                <!-- Messages: style can be found in dropdown.less-->                
                <li class="dropdown messages-menu">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                        <i class="fa fa-envelope"></i>
                        <span class="label label-success">{{len(user.messages)}}</span>
                    </a>
                    <ul class="dropdown-menu">
                        <li class="header">
                            {{chunks.messages_title}}
                        </li>
                        <li>
                            <!-- inner menu: contains the actual data -->
                            <ul class="menu">
                                % for message in user.messages:
                                <li><!-- start message -->
                                    <a href={{message.link}}>
                                        <div class="pull-left">
                                            <img src={{message.icon}} class="img-circle" alt={{message.icon_alt}}/>
                                        </div>
                                        <h4>
                                            {{message.title}}
                                            <small><i class="fa fa-clock-o"></i> {{message.time}}</small>
                                        </h4>
                                        <p>{{message.text}}</p>
                                    </a>
                                </li><!-- end message -->
                                % end
                            </ul>
                        </li>
                        <li class="footer"><a href={{chunks.all_messages_link}}>{{chunks.all_messages_text}}</a></li>
                    </ul>
                </li>
                <!-- Notifications: style can be found in dropdown.less -->
                <li class="dropdown notifications-menu">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                        <i class="fa fa-warning"></i>
                        <span class="label label-warning">{{len(user.notes)}}</span>
                    </a>
                    <ul class="dropdown-menu">
                        <li class="header">{{chunks.notes_title}}</li>
                        <li>
                            <!-- inner menu: contains the actual data -->
                            <ul class="menu">
                                % for note in user.notes:
                                <li>
                                    <a href={{note.link}}>
                                        <i class="fa fa-warning danger"}></i> {{note.text}}
                                    </a>
                                </li>
                                % end
                            </ul>
                        </li>
                        <li class="footer"><a href={{chunks.all_notes_link}}>{{chunks.all_notes_text}}</a></li>
                    </ul>
                </li>
                <!-- Tasks: style can be found in dropdown.less -->
                <li class="dropdown tasks-menu">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                        <i class="fa fa-tasks"></i>
                        <span class="label label-danger">{{len(user.tasks)}}</span>
                    </a>
                    <ul class="dropdown-menu">
                        <li class="header">{{chunks.tasks_title}}</li>
                        <li>
                            <!-- inner menu: contains the actual data -->
                            <ul class="menu">
                            % for task in user.tasks:
                                <li><!-- Task item -->
                                    <a href="#">
                                        <h3>
                                            {{task.text}}
                                            <small class="pull-right">{{task.percent}}%</small>
                                        </h3>
                                        <div class="progress xs">
                                            <div class="progress-bar progress-bar-aqua" style="width: {{task.percent}}%" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100">
                                                <span class="sr-only">{{task.percent}}% Complete</span>
                                            </div>
                                        </div>
                                    </a>
                                </li><!-- end task item -->
                            % end
                            </ul>
                        </li>
                        <li class="footer">
                            <a href={{chunks.all_tasks_link}}>{{chunks.all_tasks_text}}</a>
                        </li>
                    </ul>
                </li>
                <!-- User Account: style can be found in dropdown.less -->
                <li class="dropdown user user-menu">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                        <i class="glyphicon glyphicon-user"></i>
                        <span>{{user.name}} <i class="caret"></i></span>
                    </a>
                    <ul class="dropdown-menu">
                        <!-- User image -->
                        <li class="user-header bg-light-blue">
                            <img src={{user.icon}} class="img-circle" alt="User Image" />
                            <p>
                                {{user.name}} - {{user.agency}}
                                <small>{{user.subtext}}</small>
                            </p>
                        </li>
                        <!-- Menu Body -->
                        <li class="user-body">
                            <div class="col-xs-4 text-center">
                                <a href={{user.history_link}}>{{user.history_text}}</a>
                            </div>
                            <div class="col-xs-4 text-center">
                                <a href={{user.stats_link}}>{{user.stats_text}}</a>
                            </div>
                            <div class="col-xs-4 text-center">
                                <a href={{user.thing3_link}}>{{user.thing3_text}}</a>
                            </div>
                        </li>
                        <!-- Menu Footer-->
                        <li class="user-footer">
                            <div class="pull-left">
                                <a href={{user.profile_link}} class="btn btn-default btn-flat">{{chunks.profile_link_text}}</a>
                            </div>
                            <div class="pull-right">
                                <a href={{chunks.signout_link}} class="btn btn-default btn-flat">{{chunks.signout_link_text}}</a>
                            </div>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>
</header>
