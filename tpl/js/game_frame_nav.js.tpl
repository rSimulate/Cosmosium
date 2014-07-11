
% for content in contentFiles:
    document.getElementById('{{content}}-link').addEventListener('click', function (e)
    {
        e = e || window.event;
        
        $('#content').load('/content?name={{content}}');
        
    }, false);
% end
