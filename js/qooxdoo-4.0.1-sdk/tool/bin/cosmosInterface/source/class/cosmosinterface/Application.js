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

                var htmlElement = document.getElementById("UIApp");
                var app = new qx.ui.root.Inline(htmlElement, true, true);
                app.setLayout(new qx.ui.layout.VBox);
                app.setBackgroundColor("transparent");
                app.setSelectable(false);
                app.setFocusable(false);

                // new container
                var container = new qx.ui.container.Composite(new qx.ui.layout.Basic());
                container.setBackgroundColor("transparent");
                container.setDroppable(true);
                container.setSelectable(false);
                container.setFocusable(false);

                // Bottom Menu Bar
                var bottomMenu = this.getMenuBar();
                container.add(bottomMenu, {left: 300, top: 800});

                // add container to the inline root
                app.add(container, {flex: 1});
            },

            getMenuBar : function() {
                var frame = new qx.ui.container.Composite(new qx.ui.layout.Grow);

                qx.Class.include(qx.ui.menubar.MenuBar, qx.ui.core.MMovable);
                var menubar = new qx.ui.menubar.MenuBar;
                menubar._activateMoveHandle(menubar);
                menubar.setBackgroundColor("transparent");
                menubar.setWidth(600);
                frame.add(menubar);

                var buildMenu = new qx.ui.menubar.Button("Build", "img/UI/01_Build.png", this.getBuildMenu());
                var smallCraftMenu = new qx.ui.menubar.Button("Small Craft", "img/UI/01_SmallCraft.png", this.getSmallCraftMenu());
                var stationsMenu = new qx.ui.menubar.Button("Stations", "img/UI/02_Stations.png", this.getStationsMenu());
                var targetMenu = new qx.ui.menubar.Button("Targets", "img/UI/03_targets.png", this.getTargetMenu());
                var researchMenu = new qx.ui.menubar.Button("Research", "img/UI/04_research.png", this.getResearchMenu());
                var marketMenu = new qx.ui.menubar.Button("Market", "img/UI/05_market.png", this.getMarketMenu());
                var politicsMenu = new qx.ui.menubar.Button("Politics", "img/UI/06_Politics.png", this.getPoliticsMenu());
                var mapsMenu = new qx.ui.menubar.Button("Maps", "img/UI/07_Maps.png", this.getMapsMenu());
                var launchMenu = new qx.ui.menubar.Button("Launch", "img/UI/XX_Launch.png", this.getLaunchMenu());

                menubar.add(buildMenu);
                menubar.add(smallCraftMenu);
                menubar.add(stationsMenu);
                menubar.add(targetMenu);
                menubar.add(researchMenu);
                menubar.add(marketMenu);
                menubar.add(politicsMenu);
                menubar.add(mapsMenu);
                menubar.add(launchMenu);

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
