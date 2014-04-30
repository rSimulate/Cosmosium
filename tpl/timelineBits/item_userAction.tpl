<!--
parameters:
    time
    title
    color
    
* player actions (short item)
    time
* title = playerName _ did thing _ <the rest of the title>
-->


<li>
    <i class="fa {{icon}} bg-{{color}}"></i>
    <div class="timeline-item bg-gray">
        <span class="time"><i class="fa fa-clock-o"></i> {{time}}</span>
        <h3 class="timeline-header no-border"><a href="#" class='bg-{{color}}'>{{user}}</a> {{action}}{{remain}}</h3>
    </div>
</li>
