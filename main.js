
const symbols = ['clubs', 'diamonds', 'hearts', 'spades'];
const numbers = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];
const HighCards = ['jack', 'queen', 'king', 'ace'];

let cardPictures = [];
let cardValues = [];

//DOM elements
const doc = document;
const PlayerCardDiv = doc.querySelectorAll('#PlayerCardsDiv');
const DealerCardDiv = doc.getElementById('DealerCardsDiv');
const PotTxt = doc.getElementById('Pot');
//Player Buttons
const PlayerIncreaseBtn = doc.querySelectorAll('#IncreaseButton');
const PlayerCallBtn = doc.querySelectorAll('#CallButton');
const PlayerCheckBtn = doc.querySelectorAll('#CheckButton');

const PlayerBetInputTxt = doc.querySelectorAll('#PlayerBet');
let PlayerBetInput= [];
//Geld
const PlayerMoneyTxt = doc.querySelectorAll('#PlayerMoney');

//Multiplayer
const PlCount=3;


//Bets
let Pot;
let PlayerBets = [];
let PlayerMoney = [];
let WasRaised;
getCardPaths();

handOut(3);

Main();


async function Main(){
    //Start Procedure
    MakeToRightDataType();
    createBets();
    //Game Starts   
    //First Betting Phase
    await(BetManager());
    //first 3 cards are dealt
    handOutDealerCards(3); //3 cards for dealer
    await(BetManager()); //Second Betting Phase
    handOutDealerCards(1); //1 card for dealer
    await(BetManager()); //Third Betting Phase
    console.log("Hier sollte es weitergehen");
    handOutDealerCards(1); //last card for dealer
}
function MakeToRightDataType(){
    for(let i = 0; i < PlayerBetInputTxt.length; i++){
        PlayerBetInput.push( parseInt(PlayerBetInputTxt[i].value));
        console.log(PlayerBetInput[i]); 
    }
}

function spawnCard(SpawnDiv){
    let img = doc.createElement('img');
    let rndNum = getRandomCardIndex();
    img.src = cardPictures[rndNum]; 
    doc.body.appendChild(img);
    SpawnDiv.appendChild(img); 
    img.style.width = '100px';
    img.style.height = '150px';
    
}

function getRandomCardIndex(){
    return Math.round(Math.random() * 51);
}

function handOut(PlayerCount){
    for(let i = 0; i < PlayerCount; i++){
        spawnCard(PlayerCardDiv[i]);
        spawnCard(PlayerCardDiv[i]);
    }
}

function handOutDealerCards(cardCount){
    for(let i = 0; i < cardCount; i++){
        spawnCard(DealerCardDiv);
    }
}

function createBets(){
    for(let i = 0; i < PlCount; i++){
        PlayerBets[i]= parseInt("0");
        console.log("Playerbets von "+i+" ist "+ PlayerBets[i]);
        console.log(PlayerBets[i] === 0);
    }
}

async function BetManager(){ 

//Hier dann deguggen 
return new Promise(async resolve => {
    WasRaised = false;   
    for(let i = 0; i < PlCount; i++){  
        PlayerCardDiv[i].style.border = "5px solid red";     //highlight current player 
        await(AskForBet(i));  
        PlayerCardDiv[i].style.border = "5px solid white"; //reset border
        UpdatePot();       
    }
    if(WasRaised){
        BetManager(); //Wenn ein Spieler erhöht, wird die Funktion erneut aufgerufen
    }
    else{
        console.log("BetManager finished");
        resolve(null); //Wenn kein Spieler erhöht, wird die Funktion beendet
    }

})
}



 function AskForBet(PlayerNumber){
    
    return new Promise(resolve => {
        addEventListener("click", (EventTarget) => {
            
            if(PlayerNumber === -1) return; //Wenn PlayerNumber -1 ist, wird die Funktion beendet
            console.log(PlayerBets);
            PlayerBetInput[PlayerNumber] = parseInt(PlayerBetInputTxt[PlayerNumber].value); //Aktualisiere den Einsatz des Spielers
            console.log(Math.max(...PlayerBets)+" "+ parseInt(PlayerBetInput[PlayerNumber]));
            //Erster Fall: Spieler möchte den Einsatz erhöhen
            if(EventTarget.target === PlayerIncreaseBtn[PlayerNumber] && PlayerBetInput[PlayerNumber] >= Math.max(...PlayerBets)){
                PlayerBets[PlayerNumber] =+ +(PlayerBetInput[PlayerNumber]);
                console.log(PlayerBets);
                if(PlayerNumber !== 0)WasRaised = true; //Spieler hat erhöht, aber nur wenn er nicht der Erste ist
                PlayerNumber = -1; //reset PlayerNumber to -1 to avoid multiple clicks
                resolve();
            }
            else console.log("Konnte nicht erhöhen weil:"+ PlayerBetInput[PlayerNumber] + " > " + Math.max(...PlayerBets)); //Debugging Ausgabe
            //Zweiter Fall: Spieler möchte mitgehen
            if(EventTarget.target === PlayerCallBtn[PlayerNumber]){
                
                PlayerBets[PlayerNumber] = +Math.max(...PlayerBets); //Spieler geht mit der höchsten Wette mit
                 
                resolve(PlayerBets);                
            }
            //Dritter Fall: Spieler möchte checken
            if(EventTarget.target === PlayerCheckBtn[PlayerNumber] && Math.max(...PlayerBets) === PlayerBets[PlayerNumber]){ //CHecken ist nur möglich, wenn der Spieler die höchste Wette hat
                resolve(PlayerBets);
            }
            
        })
    })
 }
 
//Funktion die Überprüft ob man mitgehen kann, bzw erhöhen kann
function CheckForMoney(i){

}

 function UpdatePot(){
    let sum = 0;
    for(let i = 0; i < PlayerBets.length; i++){
        sum += +PlayerBets[i];
    }
    console.log("Pot: "+ sum);
    PotTxt.innerHTML = sum;
 }

function getCardPaths(){
for(let i = 0; i < symbols.length; i++){
    for(let j = 0; j < numbers.length; j++){
        cardPictures.push("Cards/"+numbers[j] + '_of_' + symbols[i] + '.png')  ;
        
    }
    for(let j = 0; j < HighCards.length ; j++){
        cardPictures.push("Cards/"+HighCards[j] + '_of_' + symbols[i] + '2.png');
        
    }
}
}