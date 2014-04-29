<!DOCTYPE html>
<html lang="en">
   <head>
       <title>three.js webglorbit controls</title>
       <meta charset="utf-8">
       <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
        <style>

            #info {
                color:#000;
                position: absolute;
                top: 0px; width: 100%;
                padding: 5px;
            }

            a {
                color: red;
            }

            #body-info-container {
                background-color: gray;
                color: white;
                position: absolute;
                top: 70px; 
                right: 0px;
                width: 200px;
                padding: 5px;
            }

            #body-info {
                font-family:Monospace;
                font-size:13px;
                text-align:center;
                font-weight: bold;

                margin: 0px;
                overflow: hidden;

            }
        </style>
   </head>

   <body>

        % include('tpl/webGL_scene')
        
        <!-- html for asteroid detail & claim sidebar -->
        <div id="body-info-container">
            <br>
            <br>
            <div id="owner-info"><b>UNCLAIMED</b></div>
            <div id="body-info">foo</div>
        </div>

    </body>
</html>