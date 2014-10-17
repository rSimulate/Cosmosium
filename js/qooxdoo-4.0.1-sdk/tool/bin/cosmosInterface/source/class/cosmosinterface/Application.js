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

                // create a date chooser component
                qx.Class.include(qx.ui.control.DateChooser, qx.ui.core.MMovable);
                var dateChooser = new qx.ui.control.DateChooser();
                dateChooser._activateMoveHandle(dateChooser.getChildControl("navigation-bar"));
                dateChooser.setMovable(true);
                container.add(dateChooser, {left: 500, top: 500});

                // add container to the inline root
                app.add(container, {flex: 1});
            }
        }
    });
