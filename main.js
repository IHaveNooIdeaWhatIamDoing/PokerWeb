
//Multiplayer
const PlCount=3;

const symbols = ['clubs', 'diamonds', 'hearts', 'spades'];
const numbers = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];
const HighCards = ['jack', 'queen', 'king', 'ace'];

let cardPictures = [];
let cardValues = [];
let PlayerCardsImg = [[]];
let DealerCardsPath = []
let PlayerCardsImgSrc = Array.from({ length: PlCount }, () => Array(2).fill(0));


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
const playerShowBtn = doc.querySelectorAll('#ShowButton');

let PlayerBetInputTxt = doc.querySelectorAll('#PlayerBet');
let PlayerBetInput= [];
//Geld
const PlayerMoneyTxt = doc.querySelectorAll('#PlayerMoney');
let PlayerMoney = [];

let winnerIndex;

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

 let cardsHidden = false;
getCardPaths();



start();
Main();



function start(){
    assignMoney();
}

async function Main(){

    cardsHidden = false;
    //Start Procedure
    handOut(PlCount);
    
    
    UpdateMoney();  
    MakeToRightDataType();
    createBets();
    createPlayerArrays();
    //Game Starts   
    //First Betting Phase
    hideCards()
    await(BetManager());
    //first 3 cards are dealt
    handOutDealerCards(3); //3 cards for dealer
    await(BetManager()); //Second Betting Phase
    handOutDealerCards(1); //1 card for dealer
    await(BetManager()); //Third Betting Phase
    handOutDealerCards(1); //last card for dealer

    LookForHands();
    
    for(let i = 0; i < PlCount; i++){
        showCards(i);
    }

    PlayerCardDiv[winnerIndex].style.border = "5px solid blue"; 
    PlayerMoney[winnerIndex] += parseInt(PotTxt.innerHTML)

    UpdateUi();
    UpdatePot();  




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
        
        PlayerCardsImg[i]= [
            spawnCard(PlayerCardDiv[i]),
            spawnCard(PlayerCardDiv[i])
        ]; 
        console.log("i: "+i  )
        console.log("Bei CardSrc wird gespeichert: "+ PlayerCardsImg[i][0].src);
        PlayerCardsImgSrc[i][0] = PlayerCardsImg[i][0].src;
        PlayerCardsImgSrc[i][1] = PlayerCardsImg[i][1].src;
        
        
   
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

function showCards(plNum){
    console.log("Cards should now be visible")
    let img = PlayerCardDiv[plNum].getElementsByTagName("img");
    cardsHidden = false;
    img[0].src = PlayerCardsImgSrc[plNum][0];
    img[1].src = PlayerCardsImgSrc[plNum][1];
}
function hideCards(){
    for(let i = 0; i < PlCount; i++){
let img = PlayerCardDiv[i].getElementsByTagName("img");
    cardsHidden = true;
    img[0].src = "pictures\\card_back_red.png"
    img[1].src = "pictures\\card_back_red.png"
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

function restart(){
    
    for(let i = 0; i < PlCount; i++){
        console.log("Deleting: " +PlayerCardDiv[i])
        PlayerCardDiv[i].children[0].remove(); 
        PlayerCardDiv[i].children[0].remove();
    }
    
    Main();
}

 function AskForBet(PlayerNumber){

    if(PlayerNumber === -1 ) return; //Wenn PlayerNumber -1 ist, wird die Funktion beendet

    
    CheckForMoney(PlayerNumber); //First Update
    
    
    return new Promise(resolve => {
        
       
        addEventListener("click", (EventTarget) => {
            if(PlayerNumber === -1) return; //Wenn PlayerNumber -1 ist, wird die Funktion beendet
            UpdateAll(); //Update all PlayerBetInput
            CheckForMoney(PlayerNumber); //First Update
            

            //Falls der Spieler seine Karten sehen will
            console.log("Wait for Player Input")
            
            if(playerShowBtn[PlayerNumber] === EventTarget.target) 
                if(cardsHidden) showCards(PlayerNumber);
                else hideCards();
                

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




//Card Stats
const pairValue = 100;
const twoPairValue = 200;
const threeOfOneKindValue = 300;
const straightValue = 400;
const flushValue = 500;
const fullHouseValue = 600;
const fourOfOneKindValue = 700;




//Check The Hands
let PlayerCards = [[]];
let DealerCards = [];
let handValues = Array(PlCount).fill(0);


function LookForHands(){

    assignePlayerCards();
    assigneDealerCards();

    CalculateHands();
    } 
    
    const notNumberValues = ["ace", "king", "jack", "queen"];
    const trueValueTable = ["0", "1","2","3","4","5","6","7","8","9","jack","queen", "king", "ace"] //the true Value of a Card is the Index of the Array
    function assignePlayerCards(){

        for(let i = 0; i < PlCount; i++)
            {          
                let trueValues = Array(2).fill(0);  

                trueValues[0] = trueValueTable.indexOf(PlayerCardsImgSrc[i][0].match(/\/Cards\/([A-Za-z0-9]+)_of_/i)[1]);
                trueValues[1] = trueValueTable.indexOf(PlayerCardsImgSrc[i][1].match(/\/Cards\/([A-Za-z0-9]+)_of_/i)[1]);
                PlayerCards[i]= [
                new Card
                (
                    PlayerCardsImgSrc[i][0].match(/_of_([a-z]+)(?:\d*)\.png/i)[1], //Symbol
                    false,
                    PlayerCardsImgSrc[i][0].match(/\/Cards\/([A-Za-z0-9]+)_of_/i)[1], //Value
                    trueValues[0],// True Value (jack = 10)

                    
                ),
                new Card
                (
                    PlayerCardsImgSrc[i][0].match(/_of_([a-z]+)(?:\d*)\.png/i)[1],
                    false,
                    PlayerCardsImgSrc[i][1].match(/\/Cards\/([A-Za-z0-9]+)_of_/i)[1],
                    trueValues[1],
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
            if(!FoldedPlayers[i])
            {
            Hand = getFullHand(i);   
                   
            CheckForPairs(i, Hand);
            CheckForFlush(Hand, i);
            CheckForStraight(Hand, i);
            checkForFullHouse(i);    
            
            calculateValue(i);
            console.log(handValues[i]);
            }
        }
        let maxValue = Math.max(...handValues);
         winnerIndex = handValues.indexOf(maxValue);
        console.log("Und der Gewinner ist: "+ winnerIndex);
    }
    function calculateValue(plNum){
        //Überprüft jeden Fall und rechnet den Score dazu
        if(isFourOfOneKind[plNum]) handValues[plNum] = fourOfOneKindValue;
        else if(isFullHouse[plNum]) handValues[plNum] = fullHouseValue;
        else if(isFlush[plNum]) handValues[plNum] = flushValue;
        else if(isStraight[plNum]) handValues[plNum] = straightValue;
        else if(isThreeOfOneKind[plNum]) handValues[plNum] = threeOfOneKindValue;
        else if(pairCount[plNum] >= 2) handValues[plNum] = twoPairValue;
        else if(isPairs[plNum]) handValues[plNum] = pairValue;

        handValues[plNum] += PlayerCards[plNum][0].trueValue + PlayerCards[plNum][0].trueValue; 
    }

    function getFullHand(i){
        let hand = []
        hand.push(PlayerCards[i][0]);
        hand.push(PlayerCards[i][1]);
        for(let j = 0; j < DealerCards.length; j++){
        hand.push(DealerCards[j]);
        }  
        return hand;
    }
    
    let isStraight = [];
    const straightCardsOrder = ["ace",'2', '3', '4', '5', '6', '7', '8', '9', '10',"jack","queen","king","ace"];
    let straightLenght = 5; 

    function CheckForStraight(hand, plNum){
        isStraight[plNum] = false;
        let orderedHand;
        isStraight[plNum] = false;
        
        orderedHand = OrderArray(hand = hand, straightCardsOrder)
        console.log("Nach Reihenfolge: " );
        console.log(orderedHand)
        let count;
        for(let i = 0; i < orderedHand.length; i++){
            if(orderedHand[i] != undefined) count++;
            if(count >= straightLenght){
                isStraight[plNum] = true;
                break;
            }
            if(orderedHand[i] == undefined) count = 0;
        }
        if(count >= 4) isStraight[plNum] = true;
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

    let isFlush = [];
    function CheckForFlush(hand, plNum){
    isFlush[plNum] = false;
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
                isFlush[plNum] = true;
            }
        }
        
    }



    let idk = [[]];
    //Pair Möglichkeiten
    let pairCount = Array(PlCount).fill(0);
    let isPairs = Array(PlCount).fill(false);
    let isFourOfOneKind = Array(PlCount).fill(false);
    let isThreeOfOneKind = Array(PlCount).fill(false);
    
    let pairs = [[]] //Das muss dann in der Funktion sein
    function CheckForPairs(plNum, hand){
    
    
    pairs[plNum] = []
        for(let i = 0; i < hand.length; i++){
            for(let j = i+1; j < hand.length; j++){
                
                if(hand[i].value == hand[j].value) //Falls Pair gefunden
                { 

                    isPairs[plNum] = true;  
                    pairCount[plNum]++; 
                    //Speichere den Index des Pairs nur ab, wenn er nicht schon gespeichert wurde, damit es keine doppelten Werte gibt
                    if(pairs[plNum].indexOf(i) == -1 && pairs[plNum].indexOf(j) == -1) pairs[plNum].push(i,j);

                    for(let y = j+1; y < hand.length; y++){
                      
                        if(hand[j].value == hand[y].value){
                        pairCount[plNum]--;
                          isThreeOfOneKind[plNum] = true;
                          
                            for(let x = y+1; x < hand.length; x++){
                                if(hand[y].value == hand[x].value){
                                    pairCount[plNum]--;
                                   isFourOfOneKind[plNum] = true;
                                }
                            }
                        }
                    }                 
                }
        //Checks for Full House 
        
            }

    
    }
    console.log("Das Ergebnis von Spieler " + plNum + " ist: " + 
        "Ist ein Pair: " + isPairs[plNum] + ", " + 
        "Ist ein Drilling: " + isThreeOfOneKind[plNum] + ", " + 
        "Ist ein Vierling: " + isFourOfOneKind[plNum]
        +" Pairanzahl: "+ pairCount[plNum]);

        console.log("Diese Pairs wurden von gefunden Player|Index: "+ pairs[plNum]);

}



let isFullHouse = []
function checkForFullHouse(num){
    if(pairs[num].length >= 4 && isThreeOfOneKind[num]) isFullHouse[num] = true;
    else isFullHouse[num] = false;
    console.log("Spieler " + num + " hat ein Fullhouse: " + isFullHouse[num]);
}



class Card{
    constructor(symbol, IsNumber, value, trueValue){
        this.symbol = symbol;
        this.IsNumber = IsNumber;
        this.value = value;
        this.trueValue = trueValue;
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

function debugArray(){
    pairCount[0] = 2
    pairCount[1] = 2
    pairCount[2] = 2
    return pairs;
}