
<script type="text/javascript" src="js/jquery-1.11.0.min.js"></script>

<script type="text/javascript" src="js/vendor/ces-browser.min.js"></script>

<script src="js/vendor/three.min.js"></script>

% if config.controlBG:
    <script src="js/vendor/OrbitControls.js"></script>
% else:
    <script src="js/vendor/page_bg_controls.js"></script>
% end
    
<script src="js/vendor/Detector.js"></script>
<script src="js/vendor/stats.min.js"></script>

<script src={{config.ownersDB}}></script> 
<script src={{config.asteroidDB}}></script> 

<script src="js/util.js"></script>
<script src="js/ellipse.js"></script>
<script src="js/ephemeris.js"></script>
<script src="js/main.js"></script>
