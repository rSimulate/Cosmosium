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
            _componentScale : parseInt(0.06 * $(document.body).height()),

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

                // Drag Content Feedback
                var dragFeedback = new qx.ui.basic.Image("img/UI/05_market.png");
                dragFeedback.setAllowGrowX(true);
                dragFeedback.setAllowShrinkX(true);
                dragFeedback.setAllowGrowY(true);
                dragFeedback.setAllowShrinkY(true);
                dragFeedback.setScale(true);
                dragFeedback.setWidth(this. _componentScale);
                dragFeedback.setHeight(this. _componentScale);
                dragFeedback.setOpacity(0.5);
                dragFeedback.setZIndex(100001); //Ridiculous index needed to overlap qx.windows
                dragFeedback.setLayoutProperties({left: -2000, top: -2000});
                dragFeedback.addListener('loaded', function(e) {
                    var el = dragFeedback.getContentElement().getDomElement();
                    el.id = "dragFeedback";
                });
                this.getRoot().add(dragFeedback);

                // Bottom Menu Bar
                var bottomMenu = this.initMenuBar(w, h, sidebarWidth, navbarHeight);
                bottomMenu.setZIndex(1010);
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
                    var left = (($(el).width() / 2) + (w / 3.2)) - wOff;
                    var top = (($(el).height() / 2) + (h / 1.02)) - hOff;
                    frame.setDomPosition(left, top);
                });
                frame.setPaddingTop(5);
                frame.setBackgroundColor("rgba(54, 85, 160, 0.35)");
                frame.setOpacity(0.3);
                frame._activateMoveHandle(frame);

                var initBuildMenu = function() {
                    var __this = _this;
                    var menu = new qx.ui.menu.Menu;

                    var stationButton = new qx.ui.menu.Button("Stations");
                    var factoryButton = new qx.ui.menu.Button("Factories");
                    var componentButton = new qx.ui.menu.Button("Components");

                    var initComponentWindow = function() {
                        var ___this = __this;
                        var window = new qx.ui.window.Window("Components", "img/UI/05_market.png");
                        window.setLayout(new qx.ui.layout.VBox);
                        window.addListenerOnce('appear', (function(window, scale) {
                            return function (e) {
                                var el = window.getContentElement().getDomElement();
                                el.id = "componentWindow";
                                window.minimize();

                                var left = (($(el).width() / 2) + (w / 2)) - wOff;
                                var top = (($(el).height() / 2) + (h / 4)) - hOff;
                                window.setDomPosition(left, top);

                                var icon = window.getChildControl("icon");
                                icon.setAllowGrowX(true);
                                icon.setAllowShrinkX(true);
                                icon.setAllowGrowY(true);
                                icon.setAllowShrinkY(true);
                                icon.setScale(true);
                                icon.setWidth(scale);
                                icon.setHeight(scale);
                            }
                        }(window, __this._componentScale)));
                        window.setLayout(new qx.ui.layout.VBox);
                        window.open();


                        var grid = new qx.ui.layout.Grid(5, 5);
                        grid.setColumnFlex(0, 1);
                        grid.setColumnFlex(1, 1);
                        var container = new qx.ui.container.Composite(new qx.ui.layout.Grid);
                        container.set({
                            backgroundColor: 'rgba(54, 85, 160, 1)',
                            margin: 5
                        });
                        container.setDroppable(true);

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
                            if (column >= maxColumns) {
                                row ++;
                                column = 0;
                            }
                            var item = new qx.ui.basic.Image(compSources[Math.floor(Math.random() * compSources.length)]);
                            item.setAllowGrowX(true);
                            item.setAllowShrinkX(true);
                            item.setAllowGrowY(true);
                            item.setAllowShrinkY(true);
                            item.setScale(true);
                            item.setWidth(___this. _componentScale);
                            item.setHeight(___this. _componentScale);
                            item.setDraggable(true);
                            item.addListenerOnce('appear', function() {
                                item.getContentElement().getDomElement().className = "component";
                            });

                            item.addListener("dragstart", function(e) {
                                e.addAction("move"); // supported actions are move, copy, and alias
                                e.addType("component"); // string type -- can be anything
                                var dragFeedback = ___this.getWidget('dragFeedback');
                                dragFeedback.setSource(e.getDragTarget().getSource());
                                dragFeedback.setZIndex(e.getDragTarget().getZIndex() + 1000000);
                            });

                            item.addListener("droprequest", (function (scale, item) {
                                return function(e) {
                                    var selection = e.getDragTarget(); // get currently selected item
                                    e.addData(e.getCurrentType(), selection); // add data to drop event to be used in target
                                    var parent = selection.getLayoutParent();

                                    // leave designated empty space to grid if that's where it's leaving from
                                    console.log(parent.getContentElement().getDomElement().id);
                                    if (parent.getContentElement().getDomElement().id == 'componentGrid') {
                                        var props = selection.getLayoutProperties();
                                        var row = props.row;
                                        var column = props.column;
                                        var emptyWidget = new qx.ui.core.Widget();
                                        emptyWidget.set({width: scale, height: scale});
                                        emptyWidget.addListenerOnce('appear', (function (widget) {
                                            return function(e) {
                                                var el = widget.getContentElement().getDomElement();
                                                el.id = "emptyWidget";
                                            }
                                        }(emptyWidget)));
                                        console.log(row, column, "Ahabara");
                                        parent.add(emptyWidget, {row: row, column: column});
                                    }
                                    ___this.getWidget('dragFeedback').setDomPosition(-2000, -2000);
                                }
                            }(___this._componentScale, item)));

                            item.addListener('dragend', function(e) {
                                ___this.getWidget('dragFeedback').setDomPosition(-2000, -2000);
                            });

                            item.addListener('drag', function(e) {
                                ___this.getWidget('dragFeedback').setDomPosition(e.getDocumentLeft() + 15,
                                        e.getDocumentTop() + 15);
                            });

                            container.add(item, {row: row, column: column});
                            column ++;
                        }

                        container.addListener('appear', function() {
                            window.set({width: $(container.getContentElement().getDomElement()).width() + 50});
                            container.getContentElement().getDomElement().id = "componentGrid";
                        });
                        container.addListener('dragover', function(e) {
                            if (!e.supportsType("component")) {
                                e.preventDefault();
                            }
                        });
                        container.addListener('drop', function(e) {
                            var slot = e.getOriginalTarget();
                            var row = slot.getLayoutProperties().row;
                            var column = slot.getLayoutProperties().column;
                            console.log(slot.getLayoutProperties(), row, column);
                            var item = e.getData("component");
                            var targetSlot = container.getLayout().getCellWidget(row, column);
                            if (targetSlot.getContentElement().getDomElement().id == "emptyWidget") {
                                targetSlot.destroy();
                                container.add(item, {row: row, column: column});
                            }
                        });
                    };

                    var initStationWindow = function () {
                        var window = new qx.ui.window.Window("Stations", "img/UI/02_Stations.png");
                        window.addListenerOnce('appear', (function (window, scale) {
                            return function(e) {
                                var el = window.getContentElement().getDomElement();
                                el.id = "stationWindow";
                                window.minimize();

                                var left = (($(el).width() / 2) + (w / 2)) - wOff;
                                var top = (($(el).height() / 2) + (h / 4)) - hOff;
                                window.setDomPosition(left, top);

                                var icon = window.getChildControl("icon");
                                icon.setAllowGrowX(true);
                                icon.setAllowShrinkX(true);
                                icon.setAllowGrowY(true);
                                icon.setAllowShrinkY(true);
                                icon.setScale(true);
                                icon.setWidth(scale);
                                icon.setHeight(scale);
                            }
                        }(window, __this._componentScale)));

                        window.setLayout(new qx.ui.layout.VBox);
                        window.open();

                        var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas);

                        container.addListener('appear', (function(container) {
                            return function(e) {
                                // TODO: Change width and height to conform to the underlying image; don't have one yet
                                window.set({
                                    width: $(container.getContentElement().getDomElement()).width() + 50,
                                    height: $(container.getContentElement().getDomElement()).height() + 50
                                });
                            }
                        }(container)));

                        // Will later use this for slot generation depending on station type
                        var getNewSlot = function() {
                            var newSlot = new qx.ui.container.Composite(new qx.ui.layout.Dock);
                            newSlot.setDroppable(true);
                            newSlot.setBackgroundColor('gray');
                            newSlot.set({width: 100, height: 100});

                            newSlot.addListener("drop", function(e) {
                                var item = e.getData("component");
                                this.add(item);
                            });

                            // Disallow all dropped items except components
                            newSlot.addListener("dragover", function(e) {
                                if (e.supportsType("component")) {
                                    var children = [];
                                    newSlot.addChildrenToQueue(children);
                                    if (children.length > 0) {
                                        e.preventDefault();
                                    }
                                }
                                else {e.preventDefault();}
                            });

                            return newSlot;
                        };

                        var slot = getNewSlot();
                        container.add(slot);

                        var slot2 = getNewSlot();
                        container.add(slot2, {left: '50%', top: '50%'});

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
                    var icon = button.getChildControl("icon", true);
                    icon.setAllowGrowX(true);
                    icon.setAllowShrinkX(true);
                    icon.setAllowGrowY(true);
                    icon.setAllowShrinkY(true);
                    icon.setScale(true);
                    icon.setWidth(this._componentScale);
                    icon.setHeight(this._componentScale);

                    frame.add(button);
                }

                return frame;
            }
        }
    });
