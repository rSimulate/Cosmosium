<!--
parameters:
    time
    title
    text
    color
    icon
    button_names
    button_links
-->


<!-- timeline item -->
<li>
    <i class="fa {{icon}} bg-{{color}}"></i>
    <div class="timeline-item">
        <span class="time"><i class="fa fa-clock-o"></i> {{time}}</span>
        <h3 class="timeline-header">{{title}}</h3>
        <div class="timeline-body">
            {{text}}
        </div>
        <div class='timeline-footer'>
            % for i in range(len(button_names)):
            %   link = button_links(i)
            %   name = button_names(i)
                <a href='{{link}}' class="btn btn-primary btn-xs">{{name}}</a>
            % end
        </div>
    </div>
</li>
<!-- END timeline item -->
