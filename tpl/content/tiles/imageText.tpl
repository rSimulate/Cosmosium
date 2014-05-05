<!-- PARAMS:           
    title = head title
    imgsrc = source loc of image
    alt_text = hovertext
    text = main body text
        -->
<div class="col-xs-12 col-xs-6">
    <div class="box box-solid bg-maroon">
        <div class="box-header">
            <h3 class="box-title">{{title}}</h3>
        </div>
        <div class="box-body">
            <div class="row">
                 <div class="col-xs-5 text-center" style="border-right: 1px solid #f4f4f4">
                <img src="{{imgsrc}}" alt="{{alt_text}}"/>
                </div>
                 <div class="col-xs-7 text-left" >
                    {{text}}
                </div>
            </div> 
        </div><!-- /.box-body -->
    </div><!-- /.box -->
</div>
        
