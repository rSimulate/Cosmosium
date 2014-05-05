<!-- 
defines a generic content tile with text only

:PARAMS:      

    color = box color name
    title = box title
    text = main body text
    bttn_id = html id for button
    bttn_txt= text for button
-->

<div class="box box-solid bg-{{color}}">
    <div class="box-header">
        <h3 class="box-title">{{title}}</h3>
    </div>
    <div class="box-body">
        <p>
            {{text}}
        </p>
        <center> <button class="btn btn-primary btn-lg" id='{{bttn_id}}'>
            {{bttn_txt}}
        </button> </center>
    </div><!-- /.box-body -->
</div><!-- /.box -->
