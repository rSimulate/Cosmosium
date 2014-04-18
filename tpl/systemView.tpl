<!DOCTYPE html>
<html lang="en">
   <head>
       <title>three.js webglorbit controls</title>
       <meta charset="utf-8">
       <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
       <style>
           body {
               color: #000;
               font-family:Monospace;
               font-size:13px;
               text-align:center;
               font-weight: bold;  
               background-color: #fff;
               margin: 0px;
               overflow: hidden;
           }  
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
               top: 0px; 
               right: 0px;
               width: 200px;
               padding: 5px;
           }

           #body-info {
               

           }
       </style>
   </head>

   <body>

        % include('tpl/webGL_scene')

    </body>
</html>