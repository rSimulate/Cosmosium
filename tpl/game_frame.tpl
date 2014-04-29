<!-- header logo: style can be found in header.less -->
<header class="header">
    <!-- TODO: new logo -->
    <a href="index.html" class="logo">
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
<div class="wrapper row-offcanvas row-offcanvas-left">
    <!-- Left side column. contains the logo and sidebar -->
    <aside class="left-side sidebar-offcanvas">
        <!-- sidebar: style can be found in sidebar.less -->
        <section class="sidebar">
            <!-- Sidebar user panel -->
            <div class="user-panel">
                <div class="pull-left image">
                    <img src="{{user.icon}}" class="img-circle" alt="User Image" />
                </div>
                <div class="pull-left info">
                    <p>{{chunks.salutation}}, {{user.name}}</p>

                    <a href="#"><i class="fa fa-circle text-success"></i> Online</a>
                </div>
            </div>
            <!-- search form -->
            <form action="#" method="get" class="sidebar-form">
                <div class="input-group">
                    <input type="text" name="q" class="form-control" placeholder="Search..."/>
                    <span class="input-group-btn">
                        <button type='submit' name='seach' id='search-btn' class="btn btn-flat"><i class="fa fa-search"></i></button>
                    </span>
                </div>
            </form>
            <!-- /.search form -->
            <!-- sidebar menu: : style can be found in sidebar.less -->
            <ul class="sidebar-menu">
                <li class="active">
                    <a href="#dash" id='dash-link'>
                        <i class="fa fa-dashboard"></i> <span>{{chunks.button1_text}}</span>
                    </a>
                </li>
                <li>
                    <a href="#systemView" id='systemView-link'>
                        <i class="ion ion-ionic"></i> <span>{{chunks.button2_text}}</span> 
                        <small class="badge pull-right bg-red">{{chunks.button2_num}}</small>
                    </a>
                </li>
                <li class="treeview">
                    <a href="#">
                        <i class="fa fa-rocket"></i>
                        <span>Missions</span>
                        <i class="fa fa-angle-left pull-right"></i>
                    </a>
                    <ul class="treeview-menu">
                        <li><a href="#missionControl" id='missionControl-link'><i class="fa fa-angle-double-right"></i> Mission Control</a></li>
                        <li><a href="#launchpad" id='launchpad-link'><i class="fa fa-angle-double-right"></i>
                         Launchpad</a></li>
                        <li><a href="#observatories" id='observatories-link'><i class="fa fa-angle-double-right"></i> Observatories</a></li>
                        <li><a href="#timeline" id='timeline-link'><i class="fa fa-angle-double-right"></i> Timeline</a></li>
                    </ul>
                </li>
                <li class="treeview">
                    <a href="#">
                        <i class="fa fa-table"></i> <span>Targets</span>
                        <i class="fa fa-angle-left pull-right"></i>
                    </a>
                    <ul class="treeview-menu">
                        <li><a href="/searchNEOs"><i class="fa fa-angle-double-right"></i> NEO's</a></li>
                        <li><a href="/searchMainBelt"><i class="fa fa-angle-double-right"></i> Main Belt</a></li>
                        <li><a href="/searchKuiperBelt"><i class="fa fa-angle-double-right"></i> Kuiper Belt</a></li>
                    </ul>
                </li>
                <li class="treeview">
                    <a href="#">
                        <i class="fa fa-flask"></i> <span>Research</span>
                        <i class="fa fa-angle-left pull-right"></i>
                    </a>
                    <ul class="treeview-menu">
                        <li><a href="#research?section=Space%20Industry" id='research_spaceIndustry-link'><i class="fa fa-angle-double-right"></i> Space Industry</a></li>
                        <li><a href="#research?section=Human%20Habitation" id='research_humanHabitation-link'><i class="fa fa-angle-double-right"></i> Human Habitation</a></li>
                        <li><a href="#research?section=Robotics%20and%20AI" id='research_robotics-link'><i class="fa fa-angle-double-right"></i> Robotics & AI</a></li>
                    </ul>
                    </a>
                </li>
                <li class="treeview">
                    <a href="#">
                        <i class="fa fa-bar-chart-o"></i>
                        <span>Economy</span>
                        <i class="fa fa-angle-left pull-right"></i>
                    </a>
                    <ul class="treeview-menu">
                        <li><a href="#launchSys" id='launchSys-link'><i class="fa fa-angle-double-right"></i> Launch Systems</a></li>
                        <li><a href="#resMarket" id='resMarket-link'><i class="fa fa-angle-double-right"></i> Resource Market</a></li>
                        <li><a href="#fuelNet" id='fuelNet-link'><i class="fa fa-angle-double-right"></i> Fuel Network</a></li>
                        <li><a href="#spaceTourism" id='spaceTourism-link'><i class="fa fa-angle-double-right"></i> Space Tourism</a></li>
                    </ul>
                </li>
                <li class="treeview">
                    <a href="#">
                        <i class="fa fa-edit"></i> <span>Policy</span>
                        <i class="fa fa-angle-left pull-right"></i>
                    </a>
                    <ul class="treeview-menu">
                        <li><a href="#outreach" id='outreach-link'><i class="fa fa-angle-double-right"></i> Outreach</a></li>
                        <li><a href="#gov" id='gov-link'><i class="fa fa-angle-double-right"></i>Government</a></li>
                        <li><a href="#org" id='org-link'><i class="fa fa-angle-double-right"></i> Organization</a></li>
                    </ul>
                </li>
            </ul>
        </section>
        <!-- /.sidebar -->
    </aside>
