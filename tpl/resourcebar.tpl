<section class="content-header" >
    <!-- js for updating the text-->
    <script type="text/javascript" onload="setInterval(updateScience,1000)">
        function updateScience(){
            document.getElementById('science').innerHTML = 
                parseInt(document.getElementById('science').innerHTML) + {{user.getDeltaScience()}};
        
        //    el = document.getElementById('science');
        //    currentV = el.innerHTML;
        //    console.log(currentV);
        //    nextV = currentV +{{user.getDeltaScience()}};
        //    console.log(nextV);
        //    el.innerHTML = nextV; // update value
        }
            
    </script>

	<h1>
		{{chunks.appName}}
		<small>{{pageTitle}}</small>
	</h1>
	<ol class="breadcrumb">
		<li><i class="fa fa-flask"></i><span>Science: <a href="#" id="science">{{user.resources.science}}</a></span></li>      
        <li><i class="fa fa-btc"></i> <span>Wealth: {{user.resources.wealth}}</span></li>
        <li><i class="fa fa-flash"></i> <span>Energy: {{user.resources.energy}}</span></li>
        <li><i class="fa fa-cog"></i> <span>Metals: {{user.resources.metals}}</span></li>
        <li><i class="fa fa-leaf"></i> <span>Organic: {{user.resources.life}}</span></li>
	</ol>
</section>
