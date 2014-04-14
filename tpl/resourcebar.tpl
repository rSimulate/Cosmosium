<section class="content-header" >
    <!-- js for updating the text-->
    <script type="text/javascript" onload="setInterval(updateAll,1000)">
        function updateAll(){
            uScience();
            uWealth();
            uEnergy();
            uMetals();
            uOrganic();
        }
            
        function uScience(){
            document.getElementById('science').innerHTML = 
                parseInt(document.getElementById('science').innerHTML) + {{user.getDeltaScience()}};
        }
        function uWealth(){
            document.getElementById('wealth').innerHTML = 
                parseInt(document.getElementById('wealth').innerHTML) + {{user.getDeltaWealth()}};
        }
        function uEnergy(){
            document.getElementById('energy').innerHTML = 
                parseInt(document.getElementById('energy').innerHTML) + {{user.getDeltaEnergy()}};
        }
        function uMetals(){
            document.getElementById('metals').innerHTML = 
                parseInt(document.getElementById('metals').innerHTML) + {{user.getDeltaMetals()}};
        }
        function uOrganic(){
            document.getElementById('organic').innerHTML = 
                parseInt(document.getElementById('organic').innerHTML) + {{user.getDeltaOrganic()}};
        }
            
    </script>

	<h1>
		{{chunks.appName}}
		<small>{{pageTitle}}</small>
	</h1>
	<ol class="breadcrumb">
		<li><i class="fa fa-flask"></i><span>Science: <a href="#" id="science">{{user.resources.science}}</a></span></li>      
        <li><i class="fa fa-btc"></i> <span>Wealth: <a href="#" id="wealth">{{user.resources.wealth}}</a></span></li>
        <li><i class="fa fa-flash"></i> <span>Energy: <a href="#" id="energy">{{user.resources.energy}}</a></span></li>
        <li><i class="fa fa-cog"></i> <span>Metals: <a href="#" id="metals">{{user.resources.metals}}</a></span></li>
        <li><i class="fa fa-leaf"></i> <span>Organic: <a href="#" id="organic">{{user.resources.life}}</a></span></li>
	</ol>
</section>
