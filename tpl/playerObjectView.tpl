    <head>
        <title>three.js webgl - Player Object View</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
        <style>

            #player-info {
                color:#000;
                position: absolute;
                top: 0px; width: 100%;
                padding: 5px;
            }

            #player-body-info-container {
                background-color: gray;
                color: white;
                position: absolute;
                top: 70px;
                right: 0px;
                width: 200px;
                padding: 5px;
            }

            #remove-object-button {
                color: red;
            }

            #player-body-info {
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
        <div id="player-container"></div>
        <div id="player-body-info-container">
            <br>
            <div id="player-body-info">foo</div>
            <h3>
                <a id="remove-object-button" href="#" >Remove this object</a>
            </h3 >
        </div>
    </body>