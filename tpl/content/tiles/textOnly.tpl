<!-- 
defines a generic content tile with text only

:PARAMS:      
    s1 = size-class 
    s2 = size-class
    color = box color name
    title = box title
    text = main body text
-->

<div class="{{s1}} {{s2}}">
    <div class="box box-solid {{color}}">
        <div class="box-header">
            <h3 class="box-title">{{title}}</h3>
        </div>
        <div class="box-body">
            <p>
                {{text}}
            </p>
        </div><!-- /.box-body -->
    </div><!-- /.box -->
</div>