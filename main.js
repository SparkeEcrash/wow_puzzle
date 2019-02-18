var isMouseDown=false;
var selectedLetters="";
var firstBoxID=null;
var lastBoxID=null;
var diffFirstAndLastID=null;
var diffCurrentAndLastID=null;
var right=false;
var highlightedBoxArray=[];
var winCount = 0;
var myAudio = new Audio('sound/warcraft_theme.mp3');

var wordList=[
        'ILLIDAN',
        'MEDIVH',
        'THRALL',
        'JAINA',
        'GROM',
        'MAIEV',
        'LILI',
        'UTHER',
        'CHEN',
        'ARTHAS'
];

$(document).ready(startApp);

function startApp() {

    $('#restart_button').click(function() {

        winCount=0;
        isMouseDown=false;
        selectedLetters="";
        firstBoxID=null;
        lastBoxID=null;
        diffFirstAndLastID=null;
        diffCurrentAndLastID=null;
        right=false;
        highlightedBoxArray=[];
        $('.victory_container').fadeOut();
        $('.box').removeClass('victory mouse-down mouse-enter');
        wordList=[
            'ILLIDAN',
            'MEDIVH',
            'THRALL',
            'JAINA',
            'GROM',
            'MAIEV',
            'LILI',
            'UTHER',
            'CHEN',
            'ARTHAS'
    ];
        $('li').removeClass('strikeThrough');
        createBoard();
    }) ;

    addMouseDownHandlerToDivsWithClassBox();
    addMouseEnterToDivsWithClassBox();
    addMouseUpHandlerToDivsWithClassBox();
    createBoard();

    $('#game-logo').click(function() {
        myAudio.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        }, false);
        myAudio.play();
    });

}

function createBoard() {
    var boardTemplate = createBoardTemplate();
    addWordsToBoard(boardTemplate);
    fillBoxWithRandomLetter();
    checkBoardForDuplicateWords(wordList);
}

function addWordsToBoard(boardTemplate){
    boardTemplate.forEach(function(line) {
        line.forEach(function(box) {
            var id = '' + box.x + box.y;
            var letter = box.letter;
            $('#'+id).text(letter);
        });
    })
}

function createBoardTemplate() {

    class Box {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.letter = '.';
            this.div = $("<div>", {
                class: "box",
                column: y,
                row: x
            });
        }
    }

    var board = [];
    var counter = 0;
    var stringArrayContainer = [];              //contains [ ['c','o','p','e'], ['v','e','s','s','e','l' ] ]
    var horORver = 0;                           // 0: vertical         1: horizontal
    var letterPlacedTrackerContainer = [];      // contains[    [['c','row','col'],['o','row','col'],['p','row','col'],['e','row','col']],      [[],[],[],[],[],[]]     ]

    for (var y = 0; y < 10; y++) {
        var row = [];
        for (var x = 0; x < 10; x++) {
            var box = new Box(y, x);
            row.push(box);
        }
        board.push(row);
    }

    function placeCrossingWordToBoard(word, coordinatePoints) {
        charArray = word.split("");
        stringArrayContainer.push(charArray);
        var letterPlacedTracker = [];
        var randomIndex = Math.floor(Math.random() * coordinatePoints.length);
        var startingCoordinateForWord = coordinatePoints[randomIndex];      //['row', 'col', 'direction', 'index of letter on current word'] //match location
        var indexOnWord = startingCoordinateForWord[3];
        if (startingCoordinateForWord[2] === 0) {           // 0: vertical
            for (var i = 0; i < word.length; i++) {
                board[startingCoordinateForWord[0] + i - indexOnWord][startingCoordinateForWord[1]].letter = charArray[i];

                var location = [charArray[i], startingCoordinateForWord[0] + i - indexOnWord, startingCoordinateForWord[1]];
                letterPlacedTracker.push(location);
            }
        } else {                                            // 1: horizontal
            for (var y = 0; y < word.length; y++) {
                board[startingCoordinateForWord[0]][startingCoordinateForWord[1] + y - indexOnWord].letter = charArray[y];

                var location = [charArray[y], startingCoordinateForWord[0], startingCoordinateForWord[1] + y - indexOnWord];
                letterPlacedTracker.push(location);
            }


        }
        counter++;
        letterPlacedTrackerContainer.push(letterPlacedTracker);
    }


    function placeWordToBoard(word) {
        var wordLength = word.length;
        var charArray = word.split("");
        stringArrayContainer.push(charArray);
        var possibility = false;
        horORver = Math.floor(Math.random() * 2);
        var while_breaker = 0;
        while (!possibility) {
            while_breaker++;
            possibility = true;
            if (horORver === 0) {
                var randomCol = Math.floor(Math.random() * (10 - wordLength));
                var randomRow = Math.floor(Math.random() * 10);
                for (var i = 0; i < wordLength; i++) {
                    if (board[randomCol + i][randomRow].letter !== '.') {                 //look here to see if you can add one more condition to check for same letter
                        possibility = false;
                    }
                }
            } else {
                var randomCol = Math.floor(Math.random() * 10);
                var randomRow = Math.floor(Math.random() * (10 - wordLength));
                for (var x = 0; x < wordLength; x++) {
                    if (board[randomCol][randomRow + x].letter !== '.') {
                        possibility = false;
                    }
                }
            }
            if (possibility && horORver === 0) {
                possibility = true;
                var letterPlacedTracker = [];
                for (var i = 0; i < wordLength; i++) {
                    board[randomCol + i][randomRow].letter = charArray[i];
                    var location = [charArray[i], randomCol + i, randomRow];
                    letterPlacedTracker.push(location);
                }
                counter++;
                letterPlacedTrackerContainer.push(letterPlacedTracker);
            } else if (possibility && horORver === 1) {
                possibility = true;
                var letterPlacedTracker = [];
                for (var x = 0; x < wordLength; x++) {
                    board[randomCol][randomRow + x].letter = charArray[x];
                    var location = [charArray[x], randomCol, randomRow + x];
                    letterPlacedTracker.push(location);
                }
                counter++;
                letterPlacedTrackerContainer.push(letterPlacedTracker);
            }
            if (while_breaker > 300) {
                possibility = true;
                var letterPlacedTracker = [];
                var location = ['?', '11', '11'];
                letterPlacedTracker.push(location);
                letterPlacedTrackerContainer.push(letterPlacedTracker);
            }
        }
    }

    function placeNextWordToBoard(word, lastWordSet) {
        horORver = 1 - horORver;
        var possible = wordPlacePossibilityChecker(word, lastWordSet);
        if (possible === false) {
            placeWordToBoard(word);
        } else if (possible.length === 0) {
            placeWordToBoard(word);
        } else {
            placeCrossingWordToBoard(word, possible);
        }
    }


    function wordPlacePossibilityChecker(word, lastWordSet) {
        sameLetter = false;
        letterMatchPoints = [];
        //[ ['e', 'index of letter on current word', 'index of letter on next word', 'direction'], [        ], ...]
        var charArray = word.split("");
        var position = [];
        for (var i = 0; i < word.length; i++) {
            for (var y = 0; y < lastWordSet.length; y++) {
                if (charArray[i] === lastWordSet[y][0]) {
                    sameLetter = true;
                    var matchSet = [charArray[i], i, y, horORver];
                    letterMatchPoints.push(matchSet);
                }
            }
        }
        if (sameLetter) {
            letterMatchPoints.forEach(function (crossPoint) {       //[ 'e', 'index of letter on current word', 'index of letter on next word', 'direction' ]
                var addWordSize = word.length;
                var previousWordSet = lastWordSet;            ////[['c','row','col'],['o','row','col'],['p','row','col'],['e','row','col']],
                var lettersToExamine = [];
                for (var i = 0; i < previousWordSet.length; i++) {
                    if (previousWordSet[i][0] === crossPoint[0]) {
                        lettersToExamine.push(previousWordSet[i]);      ////['e','row','col']
                    }
                }
                if (horORver) {
                    lettersToExamine.forEach(function (crossLocation) {     ////['e','row','col']
                        var horSpaceNeededAfter = addWordSize - crossPoint[1];
                        var horSpaceNeededBefore = addWordSize - horSpaceNeededAfter;
                        var index = crossLocation[2];
                        var row = crossLocation[1];
                        if (
                            10 - index >= horSpaceNeededAfter &&
                            index >= horSpaceNeededBefore) {
                            var possibility = true;

                            for (var i = index - horSpaceNeededBefore; i < index; i++) {
                                if (board[row][i].letter !== '.') {
                                    possibility = false;
                                }
                            }
                            for (var i = index + 1; i < index + horSpaceNeededAfter; i++) {
                                if (board[row][i].letter !== '.') {
                                    possibility = false;
                                }
                            }
                            if (possibility === true) {
                                var point = [crossLocation[1], index, horORver, crossPoint[1]];     //['row', 'col', 'direction', 'index of letter on current word']
                                position.push(point);
                            } else {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    });
                    return position;
                } else {
                    lettersToExamine.forEach(function (crossLocation) {
                        var verSpaceNeededAfter = addWordSize - crossPoint[0];
                        var verSpaceNeededBefore = addWordSize - verSpaceNeededAfter;
                        var index = crossLocation[1];
                        var column = crossLocation[2];
                        if (
                            10 - index >= verSpaceNeededAfter &&
                            index >= verSpaceNeededBefore) {
                            var possibility = true;


                            for (var i = index - verSpaceNeededBefore; i < index; i++) {
                                if (board[i][column].letter !== '.') {

                                    possibility = false;
                                }
                            }
                            for (var i = index + 1; i <= index + verSpaceNeededAfter; i++) {
                                if (board[i][column].letter !== '.') {

                                    possibility = false;
                                }
                            }
                            if (possibility === true) {
                                var point = [index, crossLocation[2], horORver, crossPoint[1]];
                                //['row', 'col', 'direction', 'index of letter on current word']
                                position.push(point);
                            } else {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    });
                    // return position;
                }
            });
            return position;
        } else {
            return false;
        }
    }

    function log() {
        console.log('ANSWER KEY');
        board.forEach(function (row) {
            console.log(
                row[0].letter,
                row[1].letter,
                row[2].letter,
                row[3].letter,
                row[4].letter,
                row[5].letter,
                row[6].letter,
                row[7].letter,
                row[8].letter,
                row[9].letter
            );
        })
    }


    var done = true;
    while (done) {
        board = [];
        for (var y = 0; y < 10; y++) {
            var row = [];
            for (var x = 0; x < 10; x++) {
                var box = new Box(y, x);
                row.push(box);
            }
            board.push(row);
        }

        stringArrayContainer = [];
        counter = 0;
        letterPlacedTrackerContainer = [];
        horORver = 0;
        placeWordToBoard(wordList[0]);
        // log(6);
        placeNextWordToBoard(wordList[1], letterPlacedTrackerContainer[0]);
        // log(8);
        placeNextWordToBoard(wordList[2], letterPlacedTrackerContainer[1]);
        // log(10);
        placeNextWordToBoard(wordList[3], letterPlacedTrackerContainer[2]);
        // log(12);
        placeNextWordToBoard(wordList[4], letterPlacedTrackerContainer[3]);
        // log(14);
        placeNextWordToBoard(wordList[5], letterPlacedTrackerContainer[4]);
        // log(16);
        placeNextWordToBoard(wordList[6], letterPlacedTrackerContainer[5]);
        // // log(18);
        placeNextWordToBoard(wordList[7], letterPlacedTrackerContainer[6]);
        // // log(20);
        placeNextWordToBoard(wordList[8], letterPlacedTrackerContainer[7]);
        // // log(22);
        placeNextWordToBoard(wordList[9], letterPlacedTrackerContainer[8]);
        // log();
        if (counter === 10) {
            done = false;
        }
    }

    log();

    return board;


}


function fillBoxWithRandomLetter() {
    for (var x=0; x < 10; x++) {
        for(var y=0; y < 10; y++) {

            var selectedBox = $(`#${x}${y}`);
            
            if (selectedBox.text() === '.') {
                
                selectedBox.text(generateRandomLetter());
            } 
        }
    }

}

function generateRandomLetter() {
    var randomLetter = '';
    var letterSelection = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for ( var char = 0; char < 1; char++ ) {
        var charIndex = Math.floor(Math.random() * letterSelection.length);
        
        randomLetter += letterSelection.charAt(charIndex);
    }

    return randomLetter;
}

function checkBoardForDuplicateWords (arrayOfWords) {
    
    for (var wordI = 0; wordI < arrayOfWords.length; wordI++) {
        var numberOfEachWord = 0;
        var comparedWord = arrayOfWords[wordI];
        
        // Horizontal Check (Left to Right)
        for (var x=0; x < 10; x++) {
            for(var y=0; y < 11 - comparedWord.length; y++) {
                var selectedBox = $(`#${x}${y}`);
                var comparedString = ''
                for (var letter=0; letter < comparedWord.length; letter++) {
                    comparedString+=($(`#${x}${y+letter}`).text());
                }
                
                if (comparedString === comparedWord) {
                    numberOfEachWord++;
                    if (numberOfEachWord > 1) {
                        createBoard();
                    }
                    
                }
                    
            }
        }
        
        //Horizontal Check (Right to Left)

        for (var x=0; x <10 ; x++) {
            
            for(var y=9; y >= 0 + comparedWord.length-1; y--) {
                var selectedBox = $(`#${x}${y}`);
                var comparedString = ''
                for (var letter=0; letter < comparedWord.length; letter++) {
                    comparedString+=($(`#${x}${y-letter}`).text());
        
                }

                if (comparedString === comparedWord) {
                    numberOfEachWord++;
                    if (numberOfEachWord > 1) {
                        createBoard();;
                    }
                    
                }
                    
            }
        }

        // Vertical Check (Up to Down)
    
        for (var x=0; x < 10; x++) {
            
            for(var y=0; y < 11 - comparedWord.length; y++) {
                var selectedBox = $(`#${y}${x}`);
                var comparedString = '';
                for (var letter=0; letter < comparedWord.length; letter++) {
                    comparedString+=($(`#${y+letter}${x}`).text());
                }
                

                if (comparedString === comparedWord) {
                    numberOfEachWord++;
                    if (numberOfEachWord > 1) {
                        createBoard();
                    }
                    
                }
            
            }
        }

        // Vertical Check (Down to Up)
        
        for (var x=9; x >= 0; x--) {
            
            for(var y=9; y >= comparedWord.length-1; y--) {
                var selectedBox = $(`#${y}${x}`);
                var comparedString = '';
                for (var letter=0; letter < comparedWord.length; letter++) {
                    comparedString+=($(`#${y-letter}${x}`).text());
                    
                }
                
                if (comparedString === comparedWord) {
                    numberOfEachWord++;
                    if (numberOfEachWord > 1) {
                        createBoard();
                    }
                    
                }
                    
            }
        }

        // Diagonal (Top to Bottom - Left to Right)

        for (var x=0; x <= 10 - comparedWord.length; x++) {
            for(var y=0; y < 11 - comparedWord.length; y++) {
                var selectedBox = $(`#${x}${y}`);
                var comparedString = ''
                for (letter=0; letter < comparedWord.length; letter++) {
                    comparedString+=($(`#${x+letter}${y+letter}`).text());
                }
                if (comparedString === comparedWord) {
                    numberOfEachWord++;
                    if (numberOfEachWord > 1) {
                        createBoard();
                    }
                    
                }
 
            }
        }

        // Diagonal (Bottom to Top - Left to Right)
        
        for (var x=9; x >= comparedWord.length-1; x--) {
            for(var y=0; y < 11 - comparedWord.length; y++) {
                var selectedBox = $(`#${x}${y}`);
                var comparedString = '';
                for (letter=0; letter < comparedWord.length; letter++) {
                    comparedString+=($(`#${x-letter}${y+letter}`).text());
                }

                if (comparedString === comparedWord) {
                    numberOfEachWord++;
                    if (numberOfEachWord > 1) {
                        createBoard();
                    }
                    
                }

            }
        }

        // Diagonal (Bottom to Top - Right to Left)
        
        for (var x=9; x >= comparedWord.length-1; x--) {
            for(var y=9; y >= comparedWord.length-1; y--) {
                var selectedBox = $(`#${x}${y}`);
                var comparedString = '';
                for (letter=0; letter < comparedWord.length; letter++) {
                    comparedString+=($(`#${x-letter}${y-letter}`).text());
                    
                }
                
                

                if (comparedString === comparedWord) {
                    numberOfEachWord++;
                    if (numberOfEachWord > 1) {
                        createBoard();
                    }
                    
                }

                 
            }
        }

        // Diagonal (Top to Bottom - Right to Left)
        
        for (var x=0; x <= 11 - comparedWord.length-1; x++) {
            for(var y=9; y >= comparedWord.length-1; y--) {
                var selectedBox = $(`#${x}${y}`);
                var comparedString = '';
                for (letter=0; letter < comparedWord.length; letter++) {
                    comparedString+=($(`#${x+letter}${y-letter}`).text());
                    
                }

                if (comparedString === comparedWord) {
                    numberOfEachWord++;
                    if (numberOfEachWord > 1) {
                        createBoard();
                    }
                    
                }

                 
            }
        }
    }
    return `true {Does not contain duplicates}`;
}

    

function addMouseDownHandlerToDivsWithClassBox(){
    $('.box').mousedown(boxMouseDownHandler);
}
function addMouseEnterToDivsWithClassBox(){
    $('.box').mouseenter(boxMouseEnterHandler);

}
function boxMouseDownHandler(){

    highlightBoxOnMouseDown();
}
function highlightBoxOnMouseDown(){
    var mouseDownBox=$(event.currentTarget);
//select first letter with mouse down
//read the letter in the box.text()
//add class with new css for box to highlight it
        mouseDownBox.addClass('mouse-down');
        var mouseDownBoxLetter=$(mouseDownBox).text();
//add the letter to selectedLetters variable
    selectedLetters+=mouseDownBoxLetter;
    highlightedBoxArray.push(mouseDownBox.attr('id'));
//change flag to true when mousedown
    isMouseDown=true;
    firstBoxID=parseFloat(mouseDownBox.attr('id'));


}
function addMouseUpHandlerToDivsWithClassBox(){
    $('.box').mouseup(mouseUpHandler);
}
function mouseUpHandler(){
    var mouseUpBox=$(event.currentTarget);
    //include the check for correct word function
    //check for win function
    //set isMouseDown to false
    isHighlightedWordOnList(selectedLetters);
    isMouseDown=false;
    lastBoxID=null;
    firstBoxID=null;
    right=false;
    selectedLetters="";
    diffFirstAndLastID=null;
}
function boxMouseEnterHandler(){//onmouseenter handler
    
    var enteredBox=$(event.currentTarget);
    var currentBoxText=enteredBox.text();

//if mouse is down hightlight boxes the cursor enters(maybe mouse over or mousemove instead of enter)
    if(isMouseDown===true&&lastBoxID===null){//took out null condition for lastboxID
        lastBoxID=parseFloat(enteredBox.attr('id'));
        diffFirstAndLastID=lastBoxID-firstBoxID;
        if( diffFirstAndLastID===1|
            diffFirstAndLastID===-1|
            diffFirstAndLastID===10|
            diffFirstAndLastID===-10|
            diffFirstAndLastID===11|
            diffFirstAndLastID===-11|
            diffFirstAndLastID===9|
            diffFirstAndLastID===-9){
        
        enteredBox.addClass('mouse-enter');
        lastBoxID=parseFloat(enteredBox.attr('id'));
        selectedLetters+=currentBoxText;
        highlightedBoxArray.push(enteredBox.attr('id'));
        
        }
    }else if(isMouseDown===true&&lastBoxID!==null){
        var currentBoxID=parseFloat(enteredBox.attr('id'));
        var diffCurrentAndLastID=currentBoxID-lastBoxID;
        if(diffFirstAndLastID===diffCurrentAndLastID){    
            switch(diffFirstAndLastID){
        
                case 1:
                    if(diffCurrentAndLastID===1){
                        enteredBox.addClass('mouse-enter');
                        lastBoxID=parseFloat(enteredBox.attr('id'));
                        selectedLetters+=currentBoxText;
                        highlightedBoxArray.push(enteredBox.attr('id'));
                    }
                case -1:
                    if(diffCurrentAndLastID===-1){
                        enteredBox.addClass('mouse-enter');
                        lastBoxID=parseFloat(enteredBox.attr('id'));
                        selectedLetters+=currentBoxText;
                        highlightedBoxArray.push(enteredBox.attr('id'));
                    }
                case -10:
                    if(diffCurrentAndLastID===-10){
                        enteredBox.addClass('mouse-enter');
                        lastBoxID=parseFloat(enteredBox.attr('id'));
                        selectedLetters+=currentBoxText;
                        highlightedBoxArray.push(enteredBox.attr('id'));
                    }
                case 10:
                    if(diffCurrentAndLastID===10){
                        enteredBox.addClass('mouse-enter');
                        lastBoxID=parseFloat(enteredBox.attr('id'));
                        selectedLetters+=currentBoxText;
                        highlightedBoxArray.push(enteredBox.attr('id'));
                    }
                case -9:
                    if(diffCurrentAndLastID===-9){
                        enteredBox.addClass('mouse-enter');
                        lastBoxID=parseFloat(enteredBox.attr('id'));
                        selectedLetters+=currentBoxText;
                        highlightedBoxArray.push(enteredBox.attr('id'));
                    }
                case -11:
                    if(diffCurrentAndLastID===-11){
                        enteredBox.addClass('mouse-enter');
                        lastBoxID=parseFloat(enteredBox.attr('id'));
                        selectedLetters+=currentBoxText;
                        highlightedBoxArray.push(enteredBox.attr('id'));
                    }
                case 9:
                    if(diffCurrentAndLastID===9){
                        enteredBox.addClass('mouse-enter');
                        lastBoxID=parseFloat(enteredBox.attr('id'));
                        selectedLetters+=currentBoxText;
                        highlightedBoxArray.push(enteredBox.attr('id'));
                    }
                case 11:
                    if(diffCurrentAndLastID===11){
                        enteredBox.addClass('mouse-enter');
                        lastBoxID=parseFloat(enteredBox.attr('id'));
                        selectedLetters+=currentBoxText;
                        highlightedBoxArray.push(enteredBox.attr('id'));
                    }
            }
        }
    }

    
}
function isHighlightedWordOnList(stringInput){
    for ( var wordI = 0; wordI < wordList.length; wordI++) {
        var comparedWord = wordList[wordI];
        if (stringInput === comparedWord) {
            winCount++;
            var nameToCrossOff = stringInput;
            $(`ul :nth-child(${wordI+1})`).addClass('strikeThrough');


            //** */need to add a class that wont be removed when an incorrect word is chosen over it
            for(var idI=0;idI<highlightedBoxArray.length;idI++){
                $('#'+highlightedBoxArray[idI]).addClass('victory')
            }
            crossWordOffList(wordI);
            return checkForWin();
        } else {
            //go through highlightedBoxArray and plug id into function to remove class

            

        }
    }
    for(var idI=0;idI<highlightedBoxArray.length;idI++){
        $('#'+highlightedBoxArray[idI]).removeClass('mouse-enter mouse-down')
    }
    highlightedBoxArray=[];


}
function crossWordOffList(foundWordIndex){
    //if list word was found remove it from the list for checking other words
    //splice from the array
    wordList.splice(foundWordIndex,1, 0)
    //put a slash through it in nav or add check mark
}
function checkForWin(){
    if(winCount===10){
        console.log('win');
        $('.victory_container').fadeIn();
    }
}

