<!-- PARAMS:            
    title = header
    imgsrc = file location of image to display
    alt_text = image hovertext
    data = list of objects/dicts each with attribs:
        .name = short descriptor 
        .val= numerical value associated with name

        
    values = list of 
        -->
<div class="col-xs-12 col-xs-6">
    <div class="box box-solid bg-maroon">
        <div class="box-header">
            <h3 class="box-title">{{title}}</h3>
        </div>
        <div class="box-body">
            <div class="row">
                 <div class="col-xs-5 text-left" style="border-right: 1px solid #f4f4f4">
                <img src="{{imgsrc}}" alt="{{alt_text}}" />
                </div>
                 <div class="col-xs-7 text-left" >
                    % for d in data:
                    <p>
                    {{d['val']}} {{d['name']}}s
                    </p>
                    % end
                </div>
            </div> 
        </div><!-- /.box-body -->
    </div><!-- /.box -->
</div>
        
