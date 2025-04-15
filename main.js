
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
const PlayerFoldBtn = doc.querySelectorAll('#FoldButton');

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
let FoldedPlayers = []; //Stores the Index of the players who folded
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
    createFoldedPlayers();
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
        if(i === 2) PlayerMoneyTxt[i].value = 100; 
        else PlayerMoneyTxt[i].value = 300; //Aktualisiere den Einsatz des Spielers
        
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

function createFoldedPlayers(){
    for(let i = 0; i < PlCount; i++){
        FoldedPlayers.push(false); 
    }
}

async function BetManager(){ 

return new Promise(async resolve => {
    WasRaised = false;   
    for(let i = 0; i < PlCount; i++){  
        PlayerCardDiv[i].style.border = "5px solid red";     //highlight current player 
        if(FoldedPlayers[i] == false) await(AskForBet(i));  //Wenn Spieler nicht gefoldet hat
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
        
        addEventListener("click", (EventTarget) => {
            if(PlayerNumber === -1) return; //Wenn PlayerNumber -1 ist, wird die Funktion beendet
            UpdateAll(); //Update all PlayerBetInput
            CheckForMoney(PlayerNumber); //First Update
            
            PlayerBetInput[PlayerNumber] = parseInt(PlayerBetInputTxt[PlayerNumber].value); //Aktualisiere den Einsatz des Spielers
            
            //Erster Fall: Spieler möchte den Einsatz erhöhen
            if(EventTarget.target === PlayerIncreaseBtn[PlayerNumber] && increaseAble){
                PlayerMoney[PlayerNumber] -= PlayerBetInput[PlayerNumber]  ; //Abziehen des Einsatzes vom Geld des Spielers
                PlayerBets[PlayerNumber] += +(PlayerBetInput[PlayerNumber]); //Spieler erhöht den Einsatz
                if(PlayerNumber !== 0)WasRaised = true; //Spieler hat erhöht, aber nur wenn er nicht der Erste ist
               PlayerNumber = -1; 
                resolve();
            }          
            
            //Zweiter Fall: Spieler möchte mitgehen
            if(EventTarget.target === PlayerCallBtn[PlayerNumber] && callAble){
                PlayerMoney[PlayerNumber] -= Math.max(...PlayerBets) - PlayerBets[PlayerNumber]; //Abziehen des Einsatzes vom Geld des Spielers
                PlayerBets[PlayerNumber] = +Math.max(...PlayerBets); //Spieler geht mit der höchsten Wette mit
                PlayerNumber = -1; 
                resolve(PlayerBets);                
            }
            //Dritter Fall: Spieler möchte checken
            if(EventTarget.target === PlayerCheckBtn[PlayerNumber] && checkAble){ //CHecken ist nur möglich, wenn der Spieler die höchste Wette hat
                PlayerNumber = -1; //reset PlayerNumber to -1 to avoid multiple clicks
                
                resolve(PlayerBets);
            }
            //4. Fall: Spieler möchte folden
            if(EventTarget.target === PlayerFoldBtn[PlayerNumber]){
                FoldedPlayers[PlayerNumber] = true; //Spieler foldet und wird zur Liste der gefoldeten Spieler hinzugefügt
                PlayerNumber = -1; //reset PlayerNumber to -1 to avoid multiple clicks              
                resolve(PlayerBets);
            }
            //5. Fall: ALL IN!
            if(EventTarget.target === PlayerCallBtn[PlayerNumber] && !callAble && !increaseAble && !checkAble){
                PlayerBets[PlayerNumber] += PlayerMoney[PlayerNumber]; //Spieler geht all in
                PlayerMoney[PlayerNumber] = 0; //Spieler hat kein Geld mehr
                PlayerNumber = -1; //reset PlayerNumber to -1 to avoid multiple clicks
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
        
        //1. Fall: höchste Bette und genug Geld -> increaseAble
        if(PlayerBetInput[i]  > 0 && PlayerMoney[i] >= PlayerBetInput[i] && PlayerBetInput[i] + PlayerBets[i] > Math.max(...PlayerBets)){
            increaseAble = true;
            callAble = true; 
            console.log("Case 1");
        }
        else increaseAble = false;
        if(PlayerMoney[i] >= Math.max(...PlayerBets)){    
            callAble = true;
            console.log("Case 2");
        }
        if(PlayerBets[i] == Math.max(...PlayerBets)){
            checkAble = true;
            callAble = false;
            console.log("Case 3");
        }
        else checkAble = false;

        if(PlayerMoney[i] <= Math.max(...PlayerBets) && PlayerBets[i] != Math.max(...PlayerBets)){
            callAble = false; 
            increaseAble = false;
            checkAble = false;
            console.log("Case 4");
        }

        UpdateUi(); 
}

function UpdateAll(){
    for(let i = 0; i < PlCount; i++){
        PlayerBetInput[i] = parseInt(PlayerBetInputTxt[i].value); //Aktualisiere den Einsatz des Spielers
        console.log("GotUpdated");
    }
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
        //Update Player Butttons
        PlayerIncreaseBtn[i].disabled = !increaseAble;
        PlayerCallBtn[i].disabled = !callAble;
        PlayerCheckBtn[i].disabled = !checkAble;
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

function Debug(i){
    console.log("Highest Bet: "+ Math.max(...PlayerBets));
    console.log("PlayerBetInput: "+ PlayerBetInput[i]);
    console.log("PlayerBet: "+ PlayerBets[i]);
    console.log("CheckAble: "+ checkAble);
    console.log("CallAble: "+ callAble);
    console.log("IncreaseAble: "+ increaseAble);
}