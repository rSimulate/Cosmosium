% include('tpl/head')

        % tex = "To track an asteroid you need: "
        % if user.resources.getScience(user) < 100:
        %   tex+=str(100-user.resources.getScience(user))+'science, '
        % end
        % if user.resources.getWealth(user) < 1000:
        %   tex+=str(1000-user.resources.getWealth(user))+'wealth, '
        % end
        % if user.resources.getEnergy(user) < 100:
        %   tex+=str(100-user.resources.getEnergy(user))+'energy, '
        % end
        % if user.resources.getMetals(user) < 10:
        %   tex+=str(10-user.resources.getMetals(user))+'metals, '
        % end
        % if user.resources.getOrganic(user) < 10:
        %   tex+=str(10-user.resources.getOrganic(user))+'organic, '
        % end
        
        % include('tpl/tile',s1='col-lg-12', s2='connectedSortable',
        %           color='bg-orange',
        %           title="You can't afford to track "+objectName+'!',
        %           text=tex )
        

%include('tpl/foot')