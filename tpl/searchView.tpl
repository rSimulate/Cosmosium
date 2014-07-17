
    <head>
        <title>three.js webgl - orbit controls</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
        <style>

            #info {
                color:#000;
                position: absolute;
                top: 0px; width: 100%;
                padding: 5px;
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
            #claim-asteroid-button {
                color: red;
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

        % include('tpl/page_chunks/webGL_shaders')

        <div id="container"></div>

        <div id="body-info-container">
            <br>
            <div id="body-info">foo</div>
            <h3>
            <a id="claim-asteroid-button" href="#">Claim this asteroid</a>
            </h3 >
        </div>

        % include('tpl/page_chunks/webGL_js')

    </body>
