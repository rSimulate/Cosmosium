<!-- PARAMS:            
    chunks
    messages
    note_count
    task_count
    user
    resources
    pageTitle
        -->


% include('tpl/head') # implicitly passed: pageTitle


    <!-- top row -->
    <div class="row">
        <div class="col-xs-12 connectedSortable">
            
        </div><!-- /.col -->
    </div>
    <!-- /.row -->

<center>
    <div class="row">
        <!-- Left col -->
      
      
      <script src="jquery.js"></script>
      <script src="jquery-jvectormap-1.0.min.js"></script>
      <script src="jquery-jvectormap-world-mill-en.js"></script>
      
         
        </section><!-- /.Left col -->
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
                
%include('tpl/foot')                
