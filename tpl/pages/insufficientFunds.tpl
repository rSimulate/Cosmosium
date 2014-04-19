% include('tpl/head')

        % tex = "To track an asteroid you need: "
        % if user.getScience() < 100:
        %   tex+=str(100-user.getScience())+'science, '
        % end
        % if user.getWealth() < 1000:
        %   tex+=str(1000-user.getWealth())+'wealth, '
        % end
        % if user.getEnergy() < 100:
        %   tex+=str(100-user.getEnergy())+'energy, '
        % end
        % if user.getMetals() < 10:
        %   tex+=str(10-user.getMetals())+'metals, '
        % end
        % if user.getOrganic() < 10:
        %   tex+=str(10-user.getOrganic())+'organic, '
        % end
        
        % include('tpl/tile',s1='col-lg-12', s2='connectedSortable',
        %           color='bg-orange',
        %           title="You can't afford to track "+objectName+'!',
        %           text=tex )
        

%include('tpl/foot')