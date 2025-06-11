

let plCount =2;

//Dom elements
const plCountText = document.getElementById("playerCountNum");
updateText();
function higherPlcount(){
    if(plCount < 9)
    plCount++;
    updateText();
}

function lowerPlcount(){
if(plCount > 2) plCount--;
updateText();
}

function updateText(){
    
plCountText.innerHTML = plCount;
}