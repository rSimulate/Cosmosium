  
<script src="http://code.jquery.com/jquery-1.11.1.min.js"></script>
<script src="js/plugins/jvectormap/jquery-jvectormap-1.2.2.min.js"></script>
<script src="js/plugins/jvectormap/jquery-jvectormap-world-mill-en.js"></script>
					  
     <!-- right col (We are only adding the ID to make the widgets sortable)-->
    <section id="launchpad" class="col-lg">
    
        <!-- Map box -->
        <div class="box box-primary">
            <div class="box-header">

                <i class="fa fa-map-marker"></i>
                <h3 class="box-title">
                    Launch Sites
                </h3>
                <div id="world-map" style="height: 400px"><!-- jVectorMap content in game_frame_nav.js --></div>
            </div>

        </div>
            <div class="box-footer" style="background-color: #f5f5f5">
                
                <div class="form-group">
                    <br>
                    <label>Payloads</label>
                    <select class="form-control">
                        <option>NEO Detector Satellite</option>
                        <option>NEO Asteroid Redirect Mission (ARM)</option>
                    </select>
                </div>
                    
                <div class="form-group">
                    <label>Using Launch Vehicle</label>
                    <select class="form-control">
                        <option>ULA Delta II</option>
                        <option>SpaceX Falcon Heavy</option>
                        <option>Soyuz </option>
                        <option>ESA Ariane 5</option>
                        <option>JAXA Epsilon</option>
                    </select>
                </div>
                <center> <button class="btn btn-primary btn-lg">Launch!</button> </center>
                <br>
            </div>	
        </div><!-- /.box-body-->

       
    </section><!-- right col -->

<script src='js/tiles/observatoryMap.js' type='text/javascript'></script>
