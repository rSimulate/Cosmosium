/* ************************************************************************

 Copyright:

 License:

 Authors:

 ************************************************************************ */

/* ************************************************************************


 ************************************************************************ */

/**
 * This is the main application class of your custom application "cosmosInterface"
 *
 * @asset(cosmosinterface/*)
 */
qx.Class.define("cosmosinterface.Application",
    {
        extend: qx.application.Inline,

        /*
         *****************************************************************************
         MEMBERS
         *****************************************************************************
         */

        members: {
            /**
             * This method contains the initial application code and gets called
             * during startup of the application
             *
             * @lint ignoreDeprecated(alert)
             */
            main: function () {
                // Call super class
                this.base(arguments);

                // Enable logging in debug variant
                if (qx.core.Environment.get("qx.debug")) {
                    // support native logging capabilities, e.g. Firebug for Firefox
                    //qx.log.appender.Native;

                    // support additional cross-browser console. Press F7 to toggle visibility
                    qx.log.appender.Console;
                }
                // Bottom Menu Bar
                var bottomMenu = this.getMenuBar();
                bottomMenu.setZIndex(1001);
                this.getRoot().add(bottomMenu, {left: 400, top: 800});
            },

            getMenuBar : function() {
                qx.Class.include(qx.ui.container.Composite, qx.ui.core.MMovable);
                var frame = new qx.ui.container.Composite(new qx.ui.layout.HBox);
                frame.setPaddingTop(5);
                frame.setBackgroundColor("rgba(54, 85, 160, 0.35)");
                frame.setOpacity(0.3);
                frame._activateMoveHandle(frame);

                var buttons = [];
                buttons.push(new qx.ui.menubar.Button(null, "img/UI/01_Build.png", this.getBuildMenu()));
                buttons.push(new qx.ui.menubar.Button(null, "img/UI/01_SmallCraft.png", this.getSmallCraftMenu()));
                buttons.push(new qx.ui.menubar.Button(null, "img/UI/02_Stations.png", this.getStationsMenu()));
                buttons.push(new qx.ui.menubar.Button(null, "img/UI/03_targets.png", this.getTargetMenu()));
                buttons.push(new qx.ui.menubar.Button(null, "img/UI/04_research.png", this.getResearchMenu()));
                buttons.push(new qx.ui.menubar.Button(null, "img/UI/05_market.png", this.getMarketMenu()));
                buttons.push(new qx.ui.menubar.Button(null, "img/UI/06_Politics.png", this.getPoliticsMenu()));
                buttons.push(new qx.ui.menubar.Button(null, "img/UI/07_Maps.png", this.getMapsMenu()));
                buttons.push(new qx.ui.menubar.Button(null, "img/UI/XX_Launch.png", this.getLaunchMenu()));

                for (var i = 0; i < buttons.length; i++) {
                    var button = buttons[i];
                    button.setOpacity(1);
                    frame.add(button);
                }

                return frame;
            },

            getBuildMenu : function() {
                var menu = new qx.ui.menu.Menu;

                var stationButton = new qx.ui.menu.Button("Stations");
                var factoryButton = new qx.ui.menu.Button("Factories");
                var componentButton = new qx.ui.menu.Button("Components");

                //stationButton.addListener("execute", this.debugButton);
                //factoryButton.addListener("execute", this.debugButton);
                //componentButton.addListener("execute", this.debugButton);

                menu.add(stationButton);
                menu.add(factoryButton);
                menu.add(componentButton);

                return menu;
            },

            getSmallCraftMenu : function() {
                return this.getBuildMenu();
            },

            getStationsMenu : function() {
                return this.getBuildMenu();
            },

            getTargetMenu : function() {
                return this.getBuildMenu();
            },

            getResearchMenu : function() {
                return this.getBuildMenu();
            },

            getMarketMenu : function() {
                return this.getBuildMenu();
            },

            getPoliticsMenu : function() {
                return this.getBuildMenu();
            },

            getMapsMenu : function() {
                return this.getBuildMenu();
            },

            getLaunchMenu: function() {
                return this.getBuildMenu();
            }
        }
    });
