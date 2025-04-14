
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

let PlayerBetInputTxt = doc.querySelectorAll('#PlayerBet');
let PlayerBetInput= [];
//Geld
const PlayerMoneyTxt = doc.querySelectorAll('#PlayerMoney');
let PlayerMoney = [];
//Multiplayer
const PlCount=3;


//Bets
let Pot;
let PlayerBets = [];
let WasRaised;
//Betting Bools
let increaseAble;
let callAble;
let checkAble;


getCardPaths();

handOut(3);

Main();


async function Main(){
    //Start Procedure
    console.log(PlayerMoneyTxt);
    assignMoney();
    UpdateMoney();
    
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
    handOutDealerCards(1); //last card for dealer
}
function MakeToRightDataType(){
    for(let i = 0; i < PlayerBetInputTxt.length; i++){
        PlayerBetInput.push( parseInt(PlayerBetInputTxt[i].value));
        
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
 function UpdateMoney(){
    for(let i = 0; i < PlCount; i++){ 
        PlayerMoney.push( parseInt(PlayerMoneyTxt[i].value)); //Aktualisiere den Einsatz des Spielers
        
    }
 }
 function assignMoney(){
    for(let i = 0; i < PlCount; i++){ 
        PlayerMoneyTxt[i].value = 300; //Aktualisiere den Einsatz des Spielers
        
    }
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

return new Promise(async resolve => {
    WasRaised = false;   
    for(let i = 0; i < PlCount; i++){  
        PlayerCardDiv[i].style.border = "5px solid red";     //highlight current player 
        await(AskForBet(i));  
        PlayerCardDiv[i].style.border = "5px solid white"; //reset border
        UpdateUi();
        UpdatePot();       
    }
    if(WasRaised){
        await(BetManager());
        resolve(null);
        //Wenn ein Spieler erhöht, wird die Funktion erneut aufgerufen
    }
    else{
        console.log("BetManager finished");
        resolve(null); //Wenn kein Spieler erhöht, wird die Funktion beendet
    }

})
}



 function AskForBet(PlayerNumber){

    if(PlayerNumber === -1) return; //Wenn PlayerNumber -1 ist, wird die Funktion beendet
    
    CheckForMoney(PlayerNumber); //First Update
    
    
    return new Promise(resolve => {
        addEventListener("input", CheckForMoney(PlayerNumber)); //Updates on input change
        addEventListener("click", (EventTarget) => {
            if(PlayerNumber === -1) return; //Wenn PlayerNumber -1 ist, wird die Funktion beendet
            
            
            PlayerBetInput[PlayerNumber] = parseInt(PlayerBetInputTxt[PlayerNumber].value); //Aktualisiere den Einsatz des Spielers
            
            //Erster Fall: Spieler möchte den Einsatz erhöhen
            if(EventTarget.target === PlayerIncreaseBtn[PlayerNumber] && increaseAble){
                PlayerMoney[PlayerNumber] -= PlayerBetInput[PlayerNumber] - PlayerBets[PlayerNumber]; //Abziehen des Einsatzes vom Geld des Spielers
                PlayerBets[PlayerNumber] =+ +(PlayerBetInput[PlayerNumber]);
                if(PlayerNumber !== 0)WasRaised = true; //Spieler hat erhöht, aber nur wenn er nicht der Erste ist
                PlayerNumber = -1; //reset PlayerNumber to -1 to avoid multiple clicks
                resolve();
            }          
            //Zweiter Fall: Spieler möchte mitgehen
            if(EventTarget.target === PlayerCallBtn[PlayerNumber] && callAble){
                PlayerMoney[PlayerNumber] -= Math.max(...PlayerBets) - PlayerBets[PlayerNumber]; //Abziehen des Einsatzes vom Geld des Spielers
                PlayerBets[PlayerNumber] = +Math.max(...PlayerBets); //Spieler geht mit der höchsten Wette mit
                 
                resolve(PlayerBets);                
            }
            //Dritter Fall: Spieler möchte checken
            if(EventTarget.target === PlayerCheckBtn[PlayerNumber] && checkAble){ //CHecken ist nur möglich, wenn der Spieler die höchste Wette hat
                resolve(PlayerBets);
            }
            
        })
    })
 }
 
//Funktion die Überprüft ob man mitgehen kann, bzw erhöhen kann
function CheckForMoney(i){

        //Update input
        if(i === -1) return;
        PlayerBetInput[i] = parseInt(PlayerBetInputTxt[i].value); 
        console.log("PlayerBetInput: "+ PlayerBetInput[i] + " PlayerMoney: "+ PlayerMoney[i] + "Max Bet "+ Math.max(...PlayerBets)); ;
        //1. Fall: höchste Bette und genug Geld -> increaseAble
        if(PlayerBetInput[i] >= Math.max(...PlayerBets) && PlayerMoney[i] >= PlayerBetInput[i]){
            increaseAble = true;
            callAble = true; 
            
        }
        else if(PlayerMoney[i] >= Math.max(...PlayerBets)){
            increaseAble = false;
            callAble = true;
        }
        if(PlayerBets[i] == Math.max(...PlayerBets)){
            checkAble = true;
            callAble = false;
        }
        else checkAble = false;

}

 function UpdatePot(){
    let sum = 0;
    for(let i = 0; i < PlayerBets.length; i++){
        sum += +PlayerBets[i];
    }
    console.log("Pot: "+ sum);
    PotTxt.innerHTML = sum;
 }
 function UpdateUi(){
    //UpdateMoney
    for(let i = 0; i < PlCount; i++){
        PlayerMoneyTxt[i].value = PlayerMoney[i]; //Aktualisiere den Einsatz des Spielers
        
    }
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