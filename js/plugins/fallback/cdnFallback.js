window.jQuery || document.write("<script src='/js/lib/techtreejs/js/lib/jquery-1.9.1.min.js'>\x3C/script>");
var e = $('body');

// CSS
if (!$("link[href='http://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css']").length)
    document.write('<link href="/css/bootstrap.min.css" rel="stylesheet" type="text/css" \x3C/>');

if (!$("link[href='http://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.1.0/css/font-awesome.css']").length)
    document.write('<link href="/css/font-awesome.css" rel="stylesheet" type="text/css" \x3C/>');

if (!$("link[href='http://cdn.jsdelivr.net/ionicons/1.4.1/css/ionicons.min.css']").length)
    document.write('<link href="/css/ionicons.min.css" rel="stylesheet" type="text/css" \x3C/>');

if (!$("link[href='http://cdnjs.cloudflare.com/ajax/libs/fullcalendar/2.0.3/fullcalendar.css']").length)
    document.write('<link href="/css/fullcalendar/fullcalendar.css" rel="stylesheet" type="text/css" \x3C/>');

if (!$("link[href='http://cdn.jsdelivr.net/bootstrap.wysihtml5/0.0.2/bootstrap-wysihtml5-0.0.2.css']").length)
    document.write('<link href="/css/bootstrap-wysihtml5/bootstrap3-wysihtml5.css" rel="stylesheet" type="text/css" \x3C/>');

// LIBS
e.hasOwnProperty('datepicker') || document.write("<script src='/js/plugins/fallback/jquery-ui.min.js'>\x3C/script>");
e.hasOwnProperty('off') || document.write("<script src='/js/plugins/fallback/bootstrap.min.js'>\x3C/script>");
e.hasOwnProperty('daterangepicker') || document.write("<script src='/js/plugins/daterangepicker/daterangepicker.js'>\x3C/script>");
e.hasOwnProperty('sparkline') || document.write("<script src='/js/plugins/sparkline/jquery.sparkline.min.js'>\x3C/script>");
moment() || document.write("<script src='/js/plugins/fallback/moment.min.js'>\x3C/script>");
e.hasOwnProperty('fullCalendar') || document.write("<script src='/js/plugins/fullcalendar/fullcalendar.min.js'>\x3C/script>");
e.hasOwnProperty('knob') || document.write("<script src='/js/plugins/jqueryKnob/jquery.knob.js'>\x3C/script>");
window.wysihtml5 || document.write("<script src='/js/plugins/jqueryKnob/jquery.knob.js'>\x3C/script>");
e.hasOwnProperty('iCheck') || document.write("<script src='/js/plugins/iCheck/icheck.min.js'>\x3C/script>");
window.CryptoJS || document.write("<script src='/js/plugins/fallback/sha256.js'>\x3C/script>");