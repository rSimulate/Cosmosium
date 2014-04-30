<!--
parameters:
    time
    title
    text
    color
    icon
-->


<!-- timeline item -->
<li>
    <i class="fa {{icon}} bg-{{color}}"></i>
    <div class="timeline-item bg-gray">
        <span class="time"><i class="fa fa-clock-o"></i> {{time}}</span>
        <h3 class="timeline-header">{{title}}</h3>
        <div class="timeline-body bg-{{color}}">
            {{text}}
        </div>
    </div>
</li>
<!-- END timeline item -->
