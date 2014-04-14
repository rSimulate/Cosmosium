<!-- PARAMS:            
    chunks
    messages
    note_count
    task_count
    user
    resources
    pageTitle
        -->
<div class="col-xs-12 col-xs-6">
    <div class="box box-solid bg-maroon">
        <div class="box-header">
            <h3 class="box-title">Mining Operations Overview</h3>
        </div>
        <div class="box-body">
            <div class="row">
                 <div class="col-xs-5 text-left" style="border-right: 1px solid #f4f4f4">
                <img src="{{user.getMineImage()}}" alt="user image" class="offline"/>
                </div>
                 <div class="col-xs-5 text-right" >
                    <p>
                    Probes: {{user.getMinersCount(0)}}
                    </p>
                    <p>
                        %   ##### TODO!!! THESE AREN'T ACTUAL GAME VALUES!!! #####
                    NEO Redirectors: {{user.research.minerLevel}}
                    </p>
                    <p>
                    Main-Belt Haulers: {{user.research.manufactureLevel}}
                    </p>
                    <p>
                    Reprossessing Barges: {{user.research.lifeScienceLevel}}
                     </p>
                    <p>
                    Von Neumann Probes: {{user.research.propultionTechLevel}}
                    </p>
                </div>
            </div> 
        </div><!-- /.box-body -->
    </div><!-- /.box -->
</div>
        
