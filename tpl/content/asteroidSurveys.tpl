<!-- PARAMS:            
    chunks
    messages
    note_count
    task_count
    user
    resources
    pageTitle
        -->

    <!-- Main row -->
    <div class='row'>
        <section class='col-lg-12 connectedSortable'>
            % include('tpl/content/tiles/imageText', 
            %   title='Asteroid Surveys',
            %   color='green',
            %   imgsrc='img/site_content/Asteroid-golevka.png',
            %   alt_text='Computer-generated model of 6489 Golevka based on Arecibo radar data',
            %   text="Asteroid surveys use your agency's observational astronomy equipment to search for asteroids. Better equipment means more detailed, more accurate, and more numerous findings. You can instruct your researchers to focus on a particular type of search below. In order to fund an asteroid survey and view the results you will need to expend some resources.")
        </section>
    </div>
    
    <div class='row'>
        <section class='col-lg-6 connectedSortable'>
            % include('tpl/content/tiles/buttonText', title='NEO Survey',
            %   color='blue',
            %   bttn_id='systemView-NEOs-link',
            %   bttn_txt='Fund NEA Survey Program',
            %   text='A near-Earth object (NEO) is a Solar System object whose orbit brings it into proximity with Earth. They include a few thousand near-Earth asteroids (NEAs), near-Earth comets, a number of solar-orbiting spacecraft, and meteoroids large enough to be tracked in space before striking the Earth. It is now widely accepted that collisions in the past have had a significant role in shaping the geological and biological history of the planet. NEOs have become of increased interest because of increased awareness of the potential danger some of the asteroids or comets pose to Earth. These asteroids are generally not as large as some main-belt asteroids and make good candidates for asteroid mining because of the comparatively low amount of delta-v required to reach them.')

        </section>
        <section class='col-lg-6 connectedSortable'>
            % include('tpl/content/tiles/buttonText', title='Main-Belt Survey',
            %   color='maroon',
            %   bttn_id='systemView-MainBelt-link',
            %   bttn_txt='Fund Main-Belt Survey Program',
            %   text='The asteroid belt is the region of the Solar System roughly between the orbits of the planets Mars and Jupiter. It is occupied by numerous irregularly shaped bodies called asteroids or minor planets. The asteroid belt is also termed the main asteroid belt or main belt to distinguish its members from other asteroids in the Solar System such as near-Earth asteroids and trojan asteroids. About half the mass of the belt is contained in the four largest asteroids, Ceres, Vesta, Pallas, and Hygiea. The remaining bodies range down to the size of a dust particle. The asteroid material is so thinly distributed that numerous unmanned spacecraft have traversed it without incident.')
        </section>
    </div>
    <div class='row'>
        <section class='col-lg-6 connectedSortable'>
            % include('tpl/content/tiles/buttonText', title='Trojan/Lagrangian Survey',
            %   color='purple',
            %   bttn_id='systemView-trojan-link',
            %   bttn_txt='Fund Trojan Survey Program',
            %   text='a trojan is a minor planet or natural satellite (moon) that shares an orbit with a planet or larger moon, but does not collide with it because it orbits around one of the two Lagrangian points of stability (trojan points), L4 and L5, which lie approximately 60° ahead of and behind the larger body, respectively. Trojan objects are also sometimes called Lagrangian objects. Asteroids in this category may create energy-productive colonizations. Although it would generally take days or even weeks to reach these with current technology, it would be possible to generate energy from sunlight at them nearly continuously since they would (due to their considerable distance from Earth) be in almost constant sunlight.')
        </section>
        <section class='col-lg-6 connectedSortable'>
            % include('tpl/content/tiles/buttonText', title='PHO-focused Survey',
            %   color='navy',
            %   bttn_id='systemView-PHO-link',
            %   bttn_txt='Fund PHO Survey Program',
            %   text='A potentially hazardous object (PHO) is a near-Earth asteroid or comet with an orbit such that it has the potential to make close approaches to the Earth and is of a size large enough to cause significant regional damage in the event of impact. These are mostly asteroids in the Amor or Apollo families. If you are starting to feel nervous about these giant rocks zooming around, this is where you ought to invest your resources.')
        </section>
        

    </div>
    
    <div class="row">
        % include('tpl/content/tiles/welcomeTile')
    </div><!-- /.row (main row) -->
    
    <script type='text/javascript' src='/js/nav_asteroidSurveys.js'></script>


