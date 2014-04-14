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
    <div class="box box-solid bg-navy">
        <div class="box-header">
            <h3 class="box-title">Tech Overview</h3>
        </div>
        <div class="box-body">
            <div class="row">
                 <div class="col-xs-5 text-left" style="border-right: 1px solid #f4f4f4">
                <img src="{{user.getTechImage()}}" alt="user image" class="offline"/>
                </div>
                 <div class="col-xs-5 text-right" >
                    <p>
                    Telescope Tech: Level {{user.research.telescopeLevel}}
                    </p>
                    <p>
                     Miner Tech: Level {{user.research.minerLevel}}
                     </p>
                    <p>
                     Energy Science Tech: Level {{user.research.EnergyScienceLevel}}
                     </p>
                    <p>
                    Manufacturing Tech: Level {{user.research.manufactureLevel}}
                    </p>
                    <p>
                     BioEngineering Tech: Level {{user.research.lifeScienceLevel}}
                     </p>
                    <p>
                    Propultion Tech: Level {{user.research.propultionTechLevel}}
                    </p>
                </div>
            </div> 
        </div><!-- /.box-body -->
    </div><!-- /.box -->
</div>
        
