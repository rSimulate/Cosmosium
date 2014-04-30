<!--
parameters:
    time
    title
    text
    color
    icon
    img
-->


<!-- timeline item -->
<li>
    <i class="fa {{icon}} bg-{{color}}"></i>
    <div class="timeline-item">
        <span class="time"><i class="fa fa-clock-o"></i> {{time}}</span>
        <h3 class="timeline-header">{{title}}</h3>
        <div class="timeline-body">
            <img src="{{img}}" class='margin' />
            {{text}}
        </div>
    </div>
</li>
<!-- END timeline item -->
