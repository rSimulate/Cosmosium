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
                // calculate window offset
                var navbarHeight = $('#topNavbar').height();
                var h = $(document.body).height() - navbarHeight - 1;
                var sidebarWidth = $('#left-sidebar').width();
                var w = $(document.body).width() - sidebarWidth;
                console.log(w, h);

                // Bottom Menu Bar
                var bottomMenu = this.initMenuBar(w, h, sidebarWidth, navbarHeight);
                bottomMenu.setZIndex(1001);
                this.getRoot().add(bottomMenu, {left: 400, top: 800});
            },

            getWidget : function(id) {
                return qx.ui.core.Widget.getWidgetByElement(document.getElementById(id));
            },

            toggleWindow : function (id) {

                var window = this.getWidget(id);
                var status = window.getMode();
                if (status == "normal" || status == "maximized") {
                    window.minimize();
                }
                else if (status == "minimized") {
                    window.restore();
                }
            },

            initMenuBar : function(w, h, wOff, hOff) {
                var _this = this;
                qx.Class.include(qx.ui.container.Composite, qx.ui.core.MMovable);
                var frame = new qx.ui.container.Composite(new qx.ui.layout.HBox);
                frame.addListenerOnce('appear', function () {
                    var el = frame.getContentElement().getDomElement();
                    el.id = "menubar";
                    var left = (($(el).width() / 2) + (w / 2.5)) - wOff;
                    var top = (($(el).height() / 2) + (h / 1.02)) - hOff;
                    frame.setDomPosition(left, top);
                });
                frame.setPaddingTop(5);
                frame.setBackgroundColor("rgba(54, 85, 160, 0.35)");
                frame.setOpacity(0.3);
                frame._activateMoveHandle(frame);

                var initBuildMenu = function() {
                    var menu = new qx.ui.menu.Menu;

                    var stationButton = new qx.ui.menu.Button("Stations");
                    var factoryButton = new qx.ui.menu.Button("Factories");
                    var componentButton = new qx.ui.menu.Button("Components");

                    var initComponentWindow = function() {
                        var window = new qx.ui.window.Window("Components", "img/UI/05_market.png");
                        window.setLayout(new qx.ui.layout.VBox);
                        window.addListenerOnce('appear', function () {
                            var el = window.getContentElement().getDomElement();
                            el.id = "componentWindow";
                            window.minimize();
                        });
                        window.addListenerOnce('appear', function () {
                            var el = window.getContentElement().getDomElement();
                            var left = (($(el).width() / 2) + (w / 2)) - wOff;
                            var top = (($(el).height() / 2) + (h / 4)) - hOff;
                            window.setDomPosition(left, top);
                        });
                        window.setLayout(new qx.ui.layout.VBox);
                        window.open();


                        var grid = new qx.ui.layout.Grid();
                        grid.setColumnFlex(0, 1);
                        grid.setColumnFlex(1, 1);
                        var container = new qx.ui.container.Composite(new qx.ui.layout.Grid);
                        container.setBackgroundColor('rgba(54, 85, 160, 1)');

                        var scroll = new qx.ui.container.Scroll(container, {flex: 1});
                        scroll.setScrollbarX('off');
                        window.add(scroll, {flex: 1});

                        var compSources = [];
                        compSources.push("img/UI/01_Build.png");
                        compSources.push("img/UI/01_SmallCraft.png");
                        compSources.push("img/UI/02_Stations.png");
                        compSources.push("img/UI/03_targets.png");
                        compSources.push("img/UI/04_research.png");
                        compSources.push("img/UI/05_market.png");
                        compSources.push("img/UI/06_Politics.png");
                        compSources.push("img/UI/07_Maps.png");
                        compSources.push("img/UI/XX_Launch.png");

                        // populate with random components
                        var column = 0;
                        var row = 0;
                        var maxColumns = 6;
                        for (var i = 0; i < 30; i ++) {
                            column ++;
                            if (column >= maxColumns) {
                                row ++;
                                column = 0;
                            }
                            var item = new qx.ui.basic.Image(compSources[Math.floor(Math.random() * compSources.length)]);
                            item.setDraggable(true);
                            item.addListenerOnce('appear', function() {
                                item.getContentElement().getDomElement().className = "component";
                            });
                            container.add(item, {row: row, column: column});
                        }
                        container.addListener('appear', function() {
                            window.set({width: $(container.getContentElement().getDomElement()).width() + 50})
                        });
                    };

                    var initStationWindow = function () {
                        var window = new qx.ui.window.Window("Stations", "img/UI/02_Stations.png");
                        window.addListenerOnce('appear', function () {
                            var el = window.getContentElement().getDomElement();
                            el.id = "stationWindow";
                            window.minimize();
                        });
                        window.addListenerOnce('appear', function () {
                            var el = window.getContentElement().getDomElement();
                            var left = (($(el).width() / 2) + (w / 2)) - wOff;
                            var top = (($(el).height() / 2) + (h / 4)) - hOff;
                            window.setDomPosition(left, top);
                        });
                        window.setLayout(new qx.ui.layout.VBox);
                        window.open();

                        var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas);

                        // Will later use this for slot generation depending on station type
                        var getNewSlot = function() {
                            var container = new qx.ui.container.Composite(new qx.ui.layout.Dock);
                            container.setDroppable(true);
                            container.setBackgroundColor('gray');
                            container.set({width: 100, height: 100});

                            return container;
                        };

                        var slot = getNewSlot();
                        console.log(slot);
                        container.add(slot);

                        qx.Class.include(qx.ui.container.Scroll, qx.ui.core.MDragDropScrolling);
                        var scroll = new qx.ui.container.Scroll(container, {flex: 1});
                        scroll.setScrollbarX('off');
                        window.add(scroll, {flex: 1});
                    };

                    initStationWindow();
                    initComponentWindow();

                    stationButton.addListener("execute", function () {_this.toggleWindow('stationWindow')});
                    //factoryButton.addListener("execute", this.debugButton);
                    componentButton.addListener("execute", function () {_this.toggleWindow('componentWindow')});

                    menu.add(stationButton);
                    menu.add(factoryButton);
                    menu.add(componentButton);

                    return menu;
                };

                var initSmallCraftMenu = function() {
                    //return initBuildMenu();
                };

                var initStationsMenu = function() {
                    //return initBuildMenu();
                };

                var initTargetMenu = function() {
                    //return initBuildMenu();
                };

                var initResearchMenu = function() {
                    //return initBuildMenu();
                };

                var initMarketMenu = function() {
                   // return initBuildMenu();
                };

                var initPoliticsMenu = function() {
                   // return initBuildMenu();
                };

                var initMapsMenu = function() {
                    //return initBuildMenu();
                };

                var initLaunchMenu = function() {
                   // return initBuildMenu();
                };

                var buttons = [];
                buttons.push(new qx.ui.menubar.Button(null, "img/UI/01_Build.png", initBuildMenu()));
                buttons.push(new qx.ui.menubar.Button(null, "img/UI/01_SmallCraft.png", initSmallCraftMenu()));
                buttons.push(new qx.ui.menubar.Button(null, "img/UI/02_Stations.png", initStationsMenu()));
                buttons.push(new qx.ui.menubar.Button(null, "img/UI/03_targets.png", initTargetMenu()));
                buttons.push(new qx.ui.menubar.Button(null, "img/UI/04_research.png", initResearchMenu()));
                buttons.push(new qx.ui.menubar.Button(null, "img/UI/05_market.png", initMarketMenu()));
                buttons.push(new qx.ui.menubar.Button(null, "img/UI/06_Politics.png", initPoliticsMenu()));
                buttons.push(new qx.ui.menubar.Button(null, "img/UI/07_Maps.png", initMapsMenu()));
                buttons.push(new qx.ui.menubar.Button(null, "img/UI/XX_Launch.png", initLaunchMenu()));

                for (var i = 0; i < buttons.length; i++) {
                    var button = buttons[i];
                    button.setOpacity(1);
                    frame.add(button);
                }

                return frame;
            }
        }
    });
