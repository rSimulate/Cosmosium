 
<!-- this row is fixed to the top... -->
<div class="row">
<!-- User tech summary -->


%include('tpl/tile_imageText'
%   ,title=pageTitle+' Level '+str(user.research.age)+' - The Age of Observation'
%   ,imgsrc=user.getTechImage()
%   ,alt_text=user.research.age
%   ,text="Mankind has spent ages gazing at the night sky, but only recently have we reached up and touched the heavens. Optical telescopes have been around for centuries, but advances in electronics and information systems now allow us to observe the sky like never before. Space-based equipment like the Hubble and James Webb telescopes allow us to see from above the soupy atmosphere, rather through it.")

</div>

<!-- Small boxes (Stat box) -->
<div class="row">
    <div class="col-lg-3 col-xs-6">
        <!-- small box -->
        <div class="small-box bg-aqua">
            <div class="inner">
                <h3>
                    +{{user.resources.getDeltaWealth(user)}}
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
                    +{{user.resources.getDeltaScience(user)}}
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
                    +{{user.resources.getDeltaOrganic(user)}}
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
                    +{{user.resources.getDeltaEnergy(user)}}
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
        <iframe src="{{tree_src}}"  style="float:center">Your browser does't support SVG? =(</iframe>
    </div><!-- /.col -->
</div><!-- /.row -->

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
