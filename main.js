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

const PlayerBetInput = doc.querySelectorAll('#PlayerBet');

//Multiplayer
PlCount=3;

//Bets
let Pot;
let PlayerBets = [];
let PlayerMoney = [];
getCardPaths();

handOut(3);

Main();


async function Main(){
    
    
    
    
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
    return Math.round(Math.random() * 52);
}

function handOut(PlayerCount){
    for(let i = 0; i < PlayerCount; i++){
        spawnCard(PlayerCardDiv[i]);
        spawnCard(PlayerCardDiv[i]);
    }
}
function getBet(){
    PlayerBets = [];
    for(let i = 1; i <= PlCount; i++){
        console.log('Player'+i+'Bet');
        
        PlayerBets.push(doc.getElementById('Player'+i+'Bet').value);
    }
}

function BetManager(){
    
    for(let i = 0; i < PlCount; i++){       
        await(AskForBet(i));
        UpdatePot();   
    }
}


 function AskForBet(PlayerNumber){
    
    return new Promise(resolve => {
        addEventListener("click", (EventTarget) => {
            //Erster Fall: Spieler möchte den Einsatz erhöhen
            if(EventTarget.target === PlayerIncreaseBtn[PlayerNumber]){
                PlayerBets[PlayerNumber] = +(PlayerBetInput[PlayerNumber].value);
                console.log(PlayerBets);
                PlayerNumber = -1; //reset PlayerNumber to -1 to avoid multiple clicks
                resolve(PlayerBets);
            }
            //Zweiter Fall: Spieler möchte mitgehen
            if(EventTarget.target === PlayerCallBtn[PlayerNumber]){
                
                PlayerBets[PlayerNumber] = +Math.max(...PlayerBets); //Spieler geht mit der höchsten Wette mit
                 
                resolve(PlayerBets);
                
            }
        })
    })
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