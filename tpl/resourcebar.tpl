<section class="content-header" >
    <!-- js for updating the text-->
    <script type="text/javascript" onload="setInterval(updateAll,1000)">
        function updateAll(){
            console.log('updating resource values');
            uScience();
            uWealth();
            uEnergy();
            uMetals();
            uOrganic();
        }
            
        function uScience(){
            document.getElementById('science').innerHTML = 
                parseInt(document.getElementById('science').innerHTML) + {{user.resources.getDeltaScience(user)}};
        }
        function uWealth(){
            document.getElementById('wealth').innerHTML = 
                parseInt(document.getElementById('wealth').innerHTML) + {{user.resources.getDeltaWealth(user)}};
        }
        function uEnergy(){
            document.getElementById('energy').innerHTML = 
                parseInt(document.getElementById('energy').innerHTML) + {{user.resources.getDeltaEnergy(user)}};
        }
        function uMetals(){
            document.getElementById('metals').innerHTML = 
                parseInt(document.getElementById('metals').innerHTML) + {{user.resources.getDeltaMetals(user)}};
        }
        function uOrganic(){
            document.getElementById('organic').innerHTML = 
                parseInt(document.getElementById('organic').innerHTML) + {{user.resources.getDeltaOrganic(user)}};
        }
    </script>

	<h1>
		{{chunks.appName}}
		<small>{{pageTitle}}</small>
	</h1>
	<ol class="breadcrumb">
		<li><i class="fa fa-flask"></i><span>Science: <a href="#" id="science">{{user.resources.getScience(user)}}</a></span></li>      
        <li><i class="fa fa-btc"></i> <span>Wealth: <a href="#" id="wealth">{{user.resources.getWealth(user)}}</a></span></li>
        <li><i class="fa fa-flash"></i> <span>Energy: <a href="#" id="energy">{{user.resources.getEnergy(user)}}</a></span></li>
        <li><i class="fa fa-cog"></i> <span>Metals: <a href="#" id="metals">{{user.resources.getMetals(user)}}</a></span></li>
        <li><i class="fa fa-leaf"></i> <span>Organic: <a href="#" id="organic">{{user.resources.getOrganic(user)}}</a></span></li>
	</ol>
</section>
