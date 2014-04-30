  
<script src="js/jquery-1.11.0.min.js"></script>
<script src="js/plugins/jvectormap/jquery-jvectormap-1.2.2.min.js"></script>
<script src="js/plugins/jvectormap/jquery-jvectormap-world-mill-en.js"></script>
					  
     <!-- right col (We are only adding the ID to make the widgets sortable)-->
    <section class="col-lg">
    
        <!-- Map box -->
        <div class="box box-primary">
            <div class="box-header">
    
                % include('tpl/tile_mapView')
                
            </div>
            <div class="box-footer">
                
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
            </div>	
        </div><!-- /.box-body-->

       
    </section><!-- right col -->

<script src='js/tiles/observatoryMap.js' type='text/javascript'></script>
