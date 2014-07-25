<!-- 
parameters:
    user

js dependencies: 
    jQuery 2.0.2 
    Bootstrap 
    AdminLTE App
    
base event types:
    major global event (for all players in game)
        time, title, text, img
    hidden player action (player-only viewable)
        time, you+title, text, img
    timespan event
        start time, end time, label
        
event types specific to this application:
    * game event
        time
        title = <event type descriptor _ the rest of the title
            event types:
                * danger _ the rest of the title
                * historical marker _ the rest of the title
                * 
        full text
        image


    * respondable events...
-->
% GAME_START = '20 July 1969' # or Dec 17 1903
% NOW = user.game.time(-1)
% colors = ['aqua','maroon','lime','fuschia','teal','navy','purple','light-blue','orange','olive','black','yellow','blue','green','red','gray']

% class userColor(object):
%   def __init__(self):
%       self.uColors= dict()
%       self.nextColor=0
%   end
%   def __call__(self,uName):
%       if uName in self.uColors:
%           return self.uColors[uName]
%       else:
%           try:    
%               self.uColors[uName] = colors[self.nextColor]
%           except IndexError:
%               self.nextColor = 0
%               self.uColors[uName] = colors[self.nextColor]
%           end
%           self.nextColor+=1
%           return self.uColors[uName]
%       end
%   end
% end    

% getUserColor=userColor()

<!-- row -->
<div id="timeline" class="row">
    <div class="col-md-12">
        <!-- The time line -->
        <ul class="timeline">
            %include('tpl/timelineBits/time_label', time=NOW, color='orange')
            
            % for event in user.game.eventList[::-1]:
                % tit = event.title.split('-')
                % if tit[0]=='Danger!':
                    % include('tpl/timelineBits/item_textOnly',icon='fa-envelope',color='red', title=tit[1], text=event.text, time=event.time)
                % elif tit[0]=='Historical:':
                    % icon='fa-envelope'
                    % color='olive'
                    % include('tpl/timelineBits/item_textOnly',icon=icon,color=color, title=tit[1], text=event.text, time=event.time)
                % elif len(tit) == 3: # user action event
                    % icon='fa-user'
                    % color=getUserColor(tit[0])
                    % include('tpl/timelineBits/item_userAction',icon=icon,color=color, user=tit[0], action=tit[1], remain=tit[2], time=event.time)
                % else: # unknown type, just feed it through
                %   include('tpl/timelineBits/item_textOnly',icon='fa-envelope', color='gray', title=event.title, text=event.text, time=event.time)
                % end   
            % end
            
            %include('tpl/timelineBits/time_label', time=GAME_START, color='green')
            <li>
                <i class="fa fa-clock-o"></i>
            </li>
        </ul>
    </div><!-- /.col -->
</div><!-- /.row -->
