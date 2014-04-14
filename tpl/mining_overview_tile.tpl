<!-- PARAMS:            
    chunks
    messages
    note_count
    task_count
    user
    resources
    pageTitle
        -->
%include('tpl/tile',
%    title='Mining Operations Overview',
%    text='Mining Probes: '    +str(user.getMinersCount(0))+'\n'
%        +'Miner Tech: '         +str(user.research.minerLevel        )+'\n'
%         +'Energy Science Tech: '+str(user.research.EnergyScienceLevel)+'\n'
%         +'Manufacturing Tech: ' +str(user.research.manufactureLevel  )+'\n'
%         +'BioEngineering Tech: '+str(user.research.lifeScienceLevel  )+'\n'
%         +'Propultion Tech: '    +str(user.research.propultionTechLevel),
%    color='bg-maroon')