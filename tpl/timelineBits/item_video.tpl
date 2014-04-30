<!--
parameters:
    time
    title
    text
    color
    icon
    video
-->


<!-- timeline item -->
<li>
    <i class="fa {{icon}} bg-{{color}}"></i>
    <div class="timeline-item">
        <span class="time"><i class="fa fa-clock-o"></i> {{time}}</span>
        <h3 class="timeline-header">{{title}}</h3>
        <div class="timeline-body">
            <iframe width="300" height="169" src="//{{video}}" frameborder="0" allowfullscreen></iframe>
        </div>
    </div>
</li>
<!-- END timeline item -->
