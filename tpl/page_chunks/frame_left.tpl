<!-- header logo: style can be found in header.less -->

<div class="wrapper row-offcanvas row-offcanvas-left sidebar-index skin-black">
    <!-- Left side column. contains the logo and sidebar -->
    <aside id="left-sidebar" class="left-side sidebar-offcanvas">
        <!-- sidebar: style can be found in sidebar.less -->
        <section class="sidebar">
            <!-- Sidebar user panel -->
            <div class="user-panel">
                <div class="pull-left image">
                    <img src="{{user.icon}}" class="img-circle" alt="User Image" />
                </div>
                <div class="pull-left info">
                    <p>{{chunks.salutation}}, <span id='userName'>{{user.name}}</span></p>

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
                    <a href="#" id='dash-link'>
                        <i class="fa fa-dashboard"></i> <span>{{chunks.button1_text}}</span>
                    </a>
                </li>
                <li>
                    <a href="#" id='systemView-link'>
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
                        <li><a href="#" id='missionControl-link'><i class="fa fa-angle-double-right"></i> Mission Control</a></li>
                        <li><a href="#" id='launchpad-link'><i class="fa fa-angle-double-right"></i>
                         Launchpad</a></li>
                        <li><a href="#" id='observatories-link'><i class="fa fa-angle-double-right"></i> Observatories</a></li>
                        <li><a href="#" id='timeline-link'><i class="fa fa-angle-double-right"></i> Timeline</a></li>
                    </ul>
                </li>
                <li class="treeview">
                    <a href="#" id="nav-link-targets">
                        <i class="fa fa-table"></i> <span>Targets</span>
                        <i class="fa fa-angle-left pull-right"></i>
                    </a>
                    <ul class="treeview-menu">
                        <li><a href="#" id='asteroidSurveys-link'><i class="fa fa-angle-double-right"></i> Asteroid Surveys</a></li>
                        <li><a href="#" id='surveyEquip-link'><i class="fa fa-angle-double-right"></i>Survey Equipment</a></li>
                    </ul>
                </li>
                <li class="treeview">
                    <a href="#">
                        <i class="fa fa-flask"></i> <span>Research</span>
                        <i class="fa fa-angle-left pull-right"></i>
                    </a>
                    <ul class="treeview-menu">
                        <li><a href="#" id='research_spaceIndustry-link'><i class="fa fa-angle-double-right"></i> Space Industry</a></li>
                        <li><a href="#" id='research_humanHabitation-link'><i class="fa fa-angle-double-right"></i> Human Habitation</a></li>
                        <li><a href="#" id='research_robotics-link'><i class="fa fa-angle-double-right"></i> Robotics & AI</a></li>
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
                        <li><a href="#" id='launchSys-link'><i class="fa fa-angle-double-right"></i> Launch Systems</a></li>
                        <li><a href="#" id='resMarket-link'><i class="fa fa-angle-double-right"></i> Resource Market</a></li>
                        <li><a href="#" id='fuelNet-link'><i class="fa fa-angle-double-right"></i> Fuel Network</a></li>
                        <li><a href="#" id='spaceTourism-link'><i class="fa fa-angle-double-right"></i> Space Tourism</a></li>
                    </ul>
                </li>
                <li class="treeview">
                    <a href="#">
                        <i class="fa fa-edit"></i> <span>Policy</span>
                        <i class="fa fa-angle-left pull-right"></i>
                    </a>
                    <ul class="treeview-menu">
                        <li><a href="#" id='outreach-link'><i class="fa fa-angle-double-right"></i> Outreach</a></li>
                        <li><a href="#" id='gov-link'><i class="fa fa-angle-double-right"></i>Government</a></li>
                        <li><a href="#" id='org-link'><i class="fa fa-angle-double-right"></i> Organization</a></li>
                    </ul>
                </li>
                <li class="treeview">
                    <a href="#">
                        <i class="fa fa-rocket"></i> <span>Player Objects</span>
                        <i class="fa fa-angle-left pull-right"></i>
                    </a>
                    <ul id='object-list-container' class="treeview-menu">
                        <li><a id='add-object-button' href='#'><i class="fa fa-angle-double-right"></i>Add New Object</a></li>
                    </ul>
                </li>
            </ul>
        </section>
        <!-- /.sidebar -->
    </aside>
