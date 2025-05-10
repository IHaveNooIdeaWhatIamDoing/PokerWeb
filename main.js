
const symbols = ['clubs', 'diamonds', 'hearts', 'spades'];
const numbers = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];
const HighCards = ['jack', 'queen', 'king', 'ace'];

let cardPictures = [];
let cardValues = [];
let PlayerCardsPath = [[]];
let DealerCardsPath = []


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
let FoldedPlayers = [];
let AllInPlayers = [];
//Betting Bools
let increaseAble;
let callAble;
let checkAble;
let allInAble;


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
    createPlayerArrays();
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
    return img;
    
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
    let DebugCards = [10,9,8,24,25,26,27,28,29]
    return DebugCards[Math.round(Math.random()*8)];
    //return Math.round(Math.random() * 51);
}

function handOut(PlayerCount){
    for(let i = 0; i < PlayerCount; i++){
        console.log("HandOut "+i);
        
        
        PlayerCardsPath[i]= [
            spawnCard(PlayerCardDiv[i]),
            spawnCard(PlayerCardDiv[i])
        ]; 
        
        
   
    }
}

function handOutDealerCards(cardCount){
    for(let i = 0; i < cardCount; i++){
        DealerCardsPath.push(spawnCard(DealerCardDiv));
    }
}

function createBets(){
    for(let i = 0; i < PlCount; i++){
        PlayerBets[i]= parseInt("0");
        console.log("Playerbets von "+i+" ist "+ PlayerBets[i]);
        console.log(PlayerBets[i] === 0);
    }
}

function createPlayerArrays(){
    for(let i = 0; i < PlCount; i++){
        FoldedPlayers.push(false); 
        AllInPlayers.push(false);
    }
}

async function BetManager(){ 

return new Promise(async resolve => {
    WasRaised = false;   
    for(let i = 0; i < PlCount; i++){  
        PlayerCardDiv[i].style.border = "5px solid red";     //highlight current player 
        if(FoldedPlayers[i] == false && AllInPlayers[i] == false ) await(AskForBet(i));  //Wenn Spieler nicht gefoldet hat
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

    if(PlayerNumber === -1 ) return; //Wenn PlayerNumber -1 ist, wird die Funktion beendet

    
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
            if(EventTarget.target === PlayerCallBtn[PlayerNumber] && callAble && !allInAble){ 
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
            if(EventTarget.target === PlayerCallBtn[PlayerNumber] && allInAble){
                PlayerBets[PlayerNumber] += PlayerMoney[PlayerNumber]; //Spieler geht all in
                PlayerMoney[PlayerNumber] = 0; //Spieler hat kein Geld mehr
                AllInPlayers[PlayerNumber] = true; 
                PlayerNumber = -1; //reset PlayerNumber to -1 to avoid multiple clicks
                
                resolve(PlayerBets); 
            }
            
        })
    })
 }
 
//Funktion die Überprüft ob man mitgehen kann, bzw erhöhen kann
function CheckForMoney(i){

        allInAble = false;
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

            PlayerCardDiv[i].style.border = "5px solid green";    
            callAble = true; 
            allInAble = true;
            increaseAble = false;
            checkAble = false;
            console.log("Case 4");
        }

        UpdateUi(); 
}

function UpdateAll(){
    for(let i = 0; i < PlCount; i++){
        PlayerBetInput[i] = parseInt(PlayerBetInputTxt[i].value); //Aktualisiere den Einsatz des Spielers
    }
}

 function UpdatePot(){
    let sum = 0;
    for(let i = 0; i < PlayerBets.length; i++){
        sum += +PlayerBets[i];
    }
    
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






//Check The Hands
let PlayerCards = [[]];
let DealerCards = [];


function LookForHands(){

    assignePlayerCards();
    assigneDealerCards();

    CalculateHands();
    } 
    
    function assignePlayerCards(){

        for(let i = 0; i < PlCount; i++)
            {            
                PlayerCards[i]= [
                new Card
                (
                    PlayerCardsPath[i][0].src.match(/_of_([a-z]+)(?:\d*)\.png/i)[1], //Symbol
                    false,
                    PlayerCardsPath[i][0].src.match(/\/Cards\/([A-Za-z0-9]+)_of_/i)[1], //Value
                ),
                new Card
                (
                    PlayerCardsPath[i][1].src.match(/_of_([a-z]+)(?:\d*)\.png/i)[1],
                    false,
                    PlayerCardsPath[i][1].src.match(/\/Cards\/([A-Za-z0-9]+)_of_/i)[1],
                )
                    ];  
            }
    }

    function assigneDealerCards(){
        for(let i = 0; i < DealerCardsPath.length; i++){
            DealerCards[i] =
                new Card(
                    DealerCardsPath[i].src.match(/_of_([a-z]+)(?:\d*)\.png/i)[1], //Symbol
                    false,
                    DealerCardsPath[i].src.match(/\/Cards\/([A-Za-z0-9]+)_of_/i)[1], //Value
                )   
        }
        
    }

    let Hand;
    function CalculateHands(){
        for(let i = 0; i < PlCount; i++){
            
            Hand = getFullHand(i);
            
            CheckForPairs(i, Hand);
            CheckForFlush(Hand)
            CheckForStraight(Hand)
            
            
            
        }
       
 
    }

    function getFullHand(i){
        let hand = [];
        hand.push(PlayerCards[i][0]);
        hand.push(PlayerCards[i][1]);
        for(let j = 0; j < DealerCards.length; j++){
        hand.push(DealerCards[j]);
        }  
        return hand;
    }
    
    let isStraight = false;
    const straightCardsOrder = ["ace",'2', '3', '4', '5', '6', '7', '8', '9', '10',"jack","queen","king","ace"];
    let straightLenght = 5;

    function CheckForStraight(hand){
        isStraight = false;
        let orderedHand;
        isStraight = false;
        
        orderedHand = OrderArray(hand = hand, straightCardsOrder)
        console.log("Nach Reihenfolge: " );
        console.log(orderedHand)
        let count;
        for(let i = 0; i < orderedHand.length; i++){
            if(orderedHand[i] != undefined) count++;
            if(count >= straightLenght){
                isStraight = true;
                break;
            }
            if(orderedHand[i] == undefined) count = 0;
        }
        console.log("So viele sind in Reihenfolge: "+ count)
    }

    function OrderArray(hand, order){
        
        let newArray = [];
        for(let i = 0; i < hand.length; i++){
            for(let j = 0; j < order.length; j++){
                if(hand[i].value == order[j]){
                    newArray[j] = hand[i]
                }
            }
        }
        return newArray;
    }

    let isFlush = false;
    function CheckForFlush(hand){
    isFlush = false;
        let symbolCards = [];
        for(let i = 0; i < symbols.length; i++) symbolCards.push(0);
        for(let i = 0; i < hand.length; i++){
            for(let j = 0; j < symbols.length; j++){
                
                if(hand[i].symbol == symbols[j]){
                    symbolCards[j] += 1;
                }
            }
        }
        for(let i = 0; i< symbolCards.length; i++){
            if(symbolCards[i] >= 5){
                isFlush = true;
            }
        }
        
    }



    let idk = [[]];
    //Pair Möglichkeiten
    let pairCount = 0;
    let isPairs = false;
    let isFourOfOneKind = false;
    let isThreeOfOneKind = false;
    
    function CheckForPairs(plNum, hand){
    let pairs = [[]] //Das muss dann in der Funktion sein
    pairCount = 0;
    isPairs = false;
    isFourOfOneKind = false;
    isThreeOfOneKind = false;
    pairs[0] = []
        for(let i = 0; i < hand.length; i++){
            for(let j = i+1; j < hand.length; j++){
                
                if(hand[i].value == hand[j].value) //Falls Pair gefunden
                { 
                    isPairs = true;  
                    pairCount++;
                    for(let y = j+1; y < hand.length; y++){
                      
                        if(hand[j].value == hand[y].value){
                        pairCount--;
                          isThreeOfOneKind = true;
                            for(let x = y+1; x < hand.length; x++){
                                if(hand[y].value == hand[x].value){
                                    pairCount--;
                                   isFourOfOneKind = true;
                                }
                            }
                        }
                    }
                    //pairs[pairCount] = [i,j] ;  //Speichert ein Pair mit dem index beider Karten
                    
                }
                
            
           
        }

       
        
    }
    console.log("Das Ergebnis von Spieler " + plNum + " ist: " + 
        "Ist ein Pair: " + isPairs + ", " + 
        "Ist ein Drilling: " + isThreeOfOneKind + ", " + 
        "Ist ein Vierling: " + isFourOfOneKind
        +" Pairanzahl: "+ pairCount);

}




class Card{
    constructor(symbol, IsNumber, value){
        this.symbol = symbol;
        this.IsNumber = IsNumber;
        this.value = value;
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

function skip(){
    const startTime = performance.now();
    handOutDealerCards(5);
    LookForHands();
    const endTime = performance.now();
    console.log("Das Programm hat so lange gebraucht: "+ startTime+" , "+ endTime);
}

