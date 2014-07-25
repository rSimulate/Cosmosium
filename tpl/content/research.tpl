<link href="/js/researchTree/tree_style.css" rel="stylesheet" type="text/css" />

<section id="research">
    <!-- this row is fixed to the top... -->
    <div class="row">
    <!-- User tech summary -->


    %include('tpl/content/tiles/imageText'
    %   ,title=pageTitle+' Level '+str(user.research.age)+' - The Age of Observation'
    %   ,imgsrc=user.getTechImage()
    %   ,alt_text=user.research.age
    %   ,color='maroon'
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
            <!-- include a div with id "tech-tree" where the tree should go -->
             <div id='tech-tree' onclick='document.getElementById("tech-tree").onclick={}'>
             </div>

            <h3><a href='#research_techLevel' id='research_techLevel'> advance to next tech level (costs science)</a></h3>
            <script type='text/javascript'>
                document.getElementById('research_techLevel').addEventListener('click', function (e){
                    e = e || window.event;
                    ws.send(message('research','techLevel'));
                }, false);
            </script>

              <!-- init the tree (using jquery here but there are other ways) -->
              <script type='text/javascript'>
                $.getScript( "http://d3js.org/d3.v3.min.js", function( data, textStatus, jqxhr ) {
                    $.getScript("/js/researchTree/tree_config.js", function(data, textStatus, jqxhr){
                        $.getScript("/js/lib/techtreejs/techtree.js", function(data, textStatus, jqxhr){
                            $.getScript("/js/researchTree/setupTreeInterface.js", function(data, textStatus, jqxhr){
                                console.log('techtree is ready.');
                                techtree.drawTree();
                            });
                        });
                    });
                });
              </script>

        </div><!-- /.col -->
    </div><!-- /.row -->

    <!-- Main row -->
    <div class="row">
        % include('tpl/content/tiles/welcomeTile')
    </div><!-- /.row (main row) -->
</section>