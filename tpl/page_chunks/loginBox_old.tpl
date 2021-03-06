<!DOCTYPE html>

<div row>

<div class="col-md-4">
	<div class="form-box" id="login-box">
	    <div class="header">Play Alpha Game Now</div>
		    <div class="body bg-gray">
		    <span class="splash-body">
    			Choose your player:
			<ul>
			    <li><form action="/loggin" method="post">
				<a href="javascript:;" onclick="parentNode.submit();">Edwin Hubble</a>
				<input type="hidden" name="userid" value="Edwin_Hubble" />
				<input type="hidden" name="password" value="redshift" />
				<input type="hidden" name="remember_me" value=false />
			    </form></li>

			    <li><form action="/loggin" method="post">
				<a href="javascript:;" onclick="parentNode.submit();">Johannes Kepler</a>
				<input type="hidden" name="userid" value="Johannes_Kepler" />
				<input type="hidden" name="password" value="telescopy" />
				<input type="hidden" name="remember_me" value=false />
			    </form></li>
			    % for demoID in demoIDs:
				% if demoID == 'Johannes_Kepler' or demoID == 'Edwin_Hubble':
				%   continue
				% end
				<li><form action="/loggin" method="post">
				    <a href="javascript:;" onclick="parentNode.submit();">{{demoID}}</a>
				    <input type="hidden" name="userid" value="{{demoID}}" />
				    <input type="hidden" name="password" value="{{demoID}}sPassword" />
				    <input type="hidden" name="remember_me" value=false />
				</form></li>
			    % end
			</ul>
		</span>    
		</div>
	   </div>
	</div>
</div>

<div class="col-md-4">        
	<div class="form-box" id="login-box">
	    <div class="header">Beta Sign Up:
	    </div>
		   <form action="/loggin" method="post">
			<div class="body bg-gray">
			    <div class="form-group">
				<input type="text" name="userid" class="form-control" placeholder="User ID"/>
			    </div>
			    <div class="form-group">
				<input type="password" name="password" class="form-control" placeholder="Password"/>
			    </div>
			    <div class="form-group">
				<input type="password" name="repeat_password" class="form-control" placeholder="Repeat Password"/>
			    </div>




			    <div class="form-group">
				<input type="checkbox" name="remember_me"/>    <span class="splash-body"> Remember me</span>
			    </div>
			</div>
			<div class="footer">                                                               
			    <button type="submit" class="btn bg-olive btn-block">Sign me up</button>
			    <!--
			    <p><a href="/recoverAccount">I forgot my password</a></p>
			    
			    <a href="/register" class="text-center">Register a new membership</a>
		    -->
			</div>
	    	</form>
	</div>
</div>

<div class="col-md-4">   
    <div class="form-box" id="login-box">
    <span class="splash-body">
        <div class="header">
	Sign in using social networks (coming soon)
	</div>
        <div class="body bg-gray">
            <div class="margin text-center">
                <button class="btn bg-light-blue btn-circle"><i class="fa fa-facebook"></i></button>
                <button class="btn bg-aqua btn-circle"><i class="fa fa-twitter"></i></button>
                <button class="btn bg-red btn-circle"><i class="fa fa-google-plus"></i></button>
            </div>
        </div>
    </span>
    </div>
</div>

</div>

