require("./MPO.js", function(){

    console.log("=MPO TEST=");

    var m = new MPO("Beerfest");
    console.log(m.name);
    console.log(m.getLoc(0));
});