<center>
    <div class="row">
        <!-- Left col -->
      
      <script src="http://code.jquery.com/jquery-1.11.1.min.js"></script>
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
                        <label>Build Observatory</label>
                        <select class="form-control">
                            <option>NEO Detecting Radar Station</option>
                            <option>Global Automated Telescope Array</option>
                            <option>Unmanned Moonar Observatory</option>
                        </select>
                    </div>
                    <center> <button class="btn btn-primary btn-lg">
                        Begin Construction
                    </button> </center>
                </div>	
            </div><!-- /.box-body-->
        </div><!-- /.box -->

           
        </section><!-- right col -->
    </div><!-- /.row (main row) -->				
</center>

<script src='js/tiles/observatoryMap.js' type='text/javascript'></script>

