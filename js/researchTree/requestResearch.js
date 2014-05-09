function displayState(){
    // modifies the base svg to represent the state of the game
    console.log('display state of SVG:');
    SVG = document.getElementById('researchTree');
    console.log(SVG);
}

function addAllElements(){
    var lay = document.getElementById("layer1");
    console.log('layer1 element:');
    console.log(lay);
    // for o in lay{
    // onclick = 'requestResearch(this)'
    // onmouseover = 'showDetails(this)'
}

function requestResearch(researchTileElement){
    // sends a research request to the webserver, used for the onclick() of research tree elements
    // if element is enabled & user can afford.
    console.log('research request:');
    console.log(researchTileElement);
    REQ_EL = researchTileElement;
    box = researchTileElement.children.box;
    img = researchTileElement.children.img;
    // edges = researchTileElement.children.edge1 edge2 edge3... etc...

    box.style.fill = 'cyan'

    // send request

    // TODO receive request elsewhere and update this?
}

function showDetails(researchTileElement){
    // shows detailed info about the element (on mouse hover)
    console.log('details request:');
    console.log(researchTileElement);
    box = researchTileElement.children.box;
    img = researchTileElement.children.img;
    box.style.fill = 'blue';

}

addAllElements();