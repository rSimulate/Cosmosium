<!-- PARAMS:            
    chunks
    messages
    note_count
    task_count
    user
    resources
    pageTitle
        -->

% include('tpl/head') # implicitly passed: pageTitle
			
% include('tpl/game_frame') # implicitly passed: chunks,messages,note_count,task_count,user,resources
            
<!-- Page Header and Resource Bar -->
% include('tpl/resourcebar') # implicitly passed: Chunks.appName, PageTitle
            


            
            
<!-- YOUR CONTENT HERE -->





                

% include('tpl/foot')