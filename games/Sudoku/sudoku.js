var nextNumbersEl = document.getElementById("next-numbers");
var scoreEl = document.getElementById("score");
var livesEl = document.getElementById("lives");
var score;
var sudoku;
var next; // array of upcoming numbers
var timerTimeout; // setTimeout() for time to shoot
var PUZZLE_COMPLETE = 0; // just a constant that we use to indicate the game is over

// How many wrongs before losing a life - don't modify this constant
// or you'll need to update CSS too!
var MAX_WRONGS = 4;
var wrongs = 0; // How many wrongs the player currently has in a row
var lives = 3; // How many lives the player has left

var settings = {
    width: 640,
    height: 360,
    nexts: 4, // How many upcoming numbers to show to player?
    timeToShoot: 5000, // in milliseconds
    visibleNumberProb: 0.95, // probability of a puzzle cell's number being visible
    scoreForCorrect: 100,
    scoreForIncorrect: -20,
    scoreForComplete: 200,
    scoreForOutOfTime: -50
}

sendSettingMsg(); // sets the iframe dimensions using SETTING message
newGame(); // Starts the game as soon as the page is loaded!

function Sudoku(sudokuEl) {
    var self = this;
    self.puzzle = []; // array of puzzle rows
    self.el = sudokuEl;
    self.numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    // How many of each number is still left to place?
    // for example {1: 9, 2: 7, 3: 9, ...}
    self.remaining = {};

    self.init = function (newPuzzle) {
        sudoku.numbers.forEach(function(value, index) {
            sudoku.remaining[value] = 9;
        })
        self.puzzle = newPuzzle;
    };

    self.draw = function () {
        self.el.innerHTML = "";
        for (var x = 0; x < 9; x++) {
            var row = document.createElement("tr");
            for (var y = 0; y < 9; y++) {
                var cell = document.createElement("td");
                cell.className = "empty-cell";
                cell.x = x;
                cell.y = y;
                // Show preview of number on mouseover
                cell.onmouseover = function (e) {
                    e.target.innerHTML = next[0];
                }
                // Listen to clicks
                cell.onclick = emptyCellClicked;
                row.appendChild(cell);
            }
            self.el.appendChild(row);
        }
    };

    self.partlyShow = function (p) {
        // Note that using RNG here is likely to result in
        // sudokus that require guessing, that's totally fine
        for (var x = 0; x < 9; x++) {
            for (var y = 0; y < 9; y++) {
                if (Math.random() < p) {
                    // this makes sure that the center square is always
                    // empty if probability of showing numbers is over 80%
                    if (p < 0.8 || x !== 4 || y !== 4) {
                        fillCell(self.puzzle[x][y], x, y);
                        self.remaining[self.puzzle[x][y]] -= 1;
                    }
                }
            }
        }
    }

    self.guess = function (n, x, y) {
        if (self.puzzle[x][y] == n) {
            self.fillCell(n, x, y);
            return true;
        } else {
            return false;
        }
    };

    self.fillCell = function(n, x, y) {
        // This function puts number n inside the cell on
        // coordinates (x,y) and removes eventListeners
        // that are only needed for empty cells
        var cell = self.cellAt(x, y);
        cell.innerHTML = n;
        cell.classList.remove("empty-cell");
        cell.onmouseover = "";
        cell.onclick = "";
    };

    self.cellAt = function(x, y) {
        return self.el.rows[x].cells[y];
    };

    self.addRemaining = function (n) {
        self.remaining[n] += 1;
    };

    self.getRemaining = function () {
        // This function returns either PUZZLE_COMPLETE if there are no more numbers
        // that need to be placed or a number from the remaining
        // ..ok I know this is a really stupid way to do this but there's no multiset
        // in JavaScript and I'm too lazy to think of a better way so I just use strings
        // as an intermediate step to get a random number
        var remainingAsString = "";
        for (var i = 1; i < 10; i++) {
            remainingAsString += String(i).repeat(self.remaining[i]);
        }
        if (remainingAsString.length < 1) {
            return PUZZLE_COMPLETE;
        }
        var n = Number(remainingAsString[randomInt(0, remainingAsString.length-1)]);
        self.remaining[n] -= 1;
        return n;
    };

    return self;
}

function newGame() {
    settings.visibleNumberProb = 0.95;
    newPuzzle();
    setScore(0);
    setLives(3, 0);
}

function newPuzzle() {
    sudoku = Sudoku(document.getElementById("sudoku"));
    sudoku.init(createSudoku());
    sudoku.draw();
    sudoku.partlyShow(settings.visibleNumberProb);
    next = [];
    nextNumbersEl.innerHTML = "";

    for (var i = 0; i < settings.nexts; i++) {
        var n = sudoku.getRemaining();
        if (n !== PUZZLE_COMPLETE) {
            next.push(n);
        }
    }
    updateNext();
}

function saveGame() {
    // Only saves score and current diffulty for now
    // because the puzzles come and go so fast that no
    // one will care if it's the same as before.
    var msg = {
        messageType: "SAVE",
        gameState: {
            score: score,
            visibleNumberProb: settings.visibleNumberProb,
            lives: lives,
            wrongs: wrongs
        }
    };
    showInfo("Game saved!");
    window.parent.postMessage(msg, "*");
}

function loadGame(gameState) {
    // restores saved game from gameState
    settings.visibleNumberProb = gameState.visibleNumberProb;
    setScore(gameState.score);
    newPuzzle();
    setLives(gameState.lives, gameState.wrongs);
    showInfo("Game loaded!");
}

function requestLoadGame() {
    // requests a loaded game from server
    var msg = {
        messageType: "LOAD_REQUEST",
    }
    window.parent.postMessage(msg, "*");
}

function sendSettingMsg () {
    var msg = {
        messageType: "SETTING",
        options: {
            "width": settings.width,
            "height": settings.height
        }
    };
    window.parent.postMessage(msg, "*");
}

function showInfo(txt) {
    // This function displays a fading text below the buttons
    // used for stuff like "Game over" or "Game saved"
    var infoDiv = document.getElementById("info");
    infoDiv.innerHTML = txt;

    // this little trick seems to be the easiest way to reset css animation
    infoDiv.classList.remove("fade-text");
    void infoDiv.offsetWidth;
    infoDiv.classList.add("fade-text");
}

function emptyCellClicked(e) {
    // handles the clicks - check if a guess is correct,
    // play sounds, give points accordingly
    var n = next.shift();
    if (sudoku.guess(n, e.target.x, e.target.y)) {
        playSound("dudududu");
        setScore(score + settings.scoreForCorrect);
        setLives(lives, 0);
    } else {
        highlightIllegal(n, e.target.x, e.target.y, sudoku.puzzle);
        setScore(score + settings.scoreForIncorrect);
        if (setLives(lives, wrongs+1) <= 0) {
            gameOver();
            return;
        }
        playSound("puff");
        sudoku.addRemaining(n);
        e.target.innerHTML = next[0];
    }
    var n = sudoku.getRemaining();
    if (n === PUZZLE_COMPLETE) {
        if  (next.length === 0) {
            puzzleCompleted();
            return;
        }
    } else {
        next.push(n);
        restartTimer();
    }
    updateNext();
}

function puzzleCompleted() {
    playSound("levelcomplete");
    showInfo("Level complete!");
    setLives(3, 0);
    setScore(score + settings.scoreForComplete);
    settings.visibleNumberProb = (settings.visibleNumberProb+0.3)/2;
    newPuzzle();
}

function updateNext() {
    // updates the GUI for upcoming numbers
    nextNumbersEl.innerHTML = "";
    for (var n of next) {
        var nextEl = document.createElement("div");
        nextEl.innerHTML = n;
        nextNumbersEl.appendChild(nextEl);
    }
    restartTimer();
}

function restartTimer() {
    // Reset the CSS animation
    var timer = document.getElementById("timer");
    timer.style.animationDuration = (settings.timeToShoot/1000)+"s";
    timer.classList.remove("timer");
    void timer.offsetWidth;
    timer.classList.add("timer");
    // Restart timerTimeout
    clearTimeout(timerTimeout);
    timerTimeout = setTimeout(function() {
        // This function is what happens when you run out of time to shoot
        setScore(score+settings.scoreForOutOfTime);
        sudoku.addRemaining(next.shift());
        var n = sudoku.getRemaining();
        if (n !== PUZZLE_COMPLETE) {
            next.push(n);
        }
        updateMouseoverPreview();
        updateNext();
        if (setLives(lives-1, 0) <= 0) {
            gameOver();
        } else {
            playSound("outoftime");
        }
    }, settings.timeToShoot);
}

function updateMouseoverPreview() {
    // Updates the preview in the cell mouse is currently hovering over; only
    // needed when player runs out of time while hovering over a cell (preview
    // normally refreshes when mouse is moved into the cell).
    var hoveringOver = document.querySelectorAll(":hover");
    if (hoveringOver.length) {
        var currentCell = hoveringOver[hoveringOver.length-1];
        if (currentCell.classList.contains("empty-cell")) {
            currentCell.innerHTML = next[0];
        }
    }
}

function setScore(n) {
    // This function should be used to change value of score
    // because this updates the GUI as well
    score = n;
    scoreEl.innerHTML = score;
}

function setLives(newLives, newWrongs) {
    // This function should be used to change value of lives
    // and/or wrongs, because this checks if you're running out
    // of lives and updates the GUI too
    if (newWrongs >= MAX_WRONGS) {
        lives = newLives - 1;
        wrongs = 0;
    } else {
        lives = newLives;
        wrongs = newWrongs;
    }
    if (lives > 0) {
        // repeat lives-1 times because there's ::after selector 
        // in the CSS that adds the last heart.
        var livesText = "♥".repeat(lives-1);
        livesEl.innerHTML = livesText;
        // this class changes the opacity of the last heart that is added
        // with aforementioned ::after selector so it can act as an 
        // indicator of how many wrong guesses you have left
        livesEl.className = "wrongs"+wrongs;
    }
    return lives;
}

function gameOver() {
    playSound("wumwumwum");
    var msg = {
        messageType: "SCORE",
        score: score
    };
    window.parent.postMessage(msg, "*");
    showInfo("Game over! Score: "+score);
    newGame();
}

function randomInt(from, to) {
    // just returns random integer from closed range
    return Math.floor(from + Math.random() * (to - from + 1));
}

function shuffled(a) {
    // this function returns a new array containing given array's
    // elements in a random order
    var b = a.slice();
    for (var i = 0; i < b.length; i++) {
        var r = randomInt(i, b.length-1);
        var x = b[r];
        b[r] = b[i];
        b[i] = x;
    }
    return b;
}

function shiftLeft (a, n) {
    // shifts array n times to the left, adding
    // the shifted elements to the end
    for (var i = 0; i < n; i++) {
        a.push(a.shift());
    }
    return a;
};

function rotatePuzzle(puzzle) {
    var rotated = [];
    for (var x = 0; x < 9; x++){
        rotated.push([]);
        for (var y = 8; y >= 0; y--) {
            rotated[x].push(puzzle[y][x]);
        }
    }
    return rotated;
}

function highlightIllegal(n, x, y, puzzle) {
    // After a wrong guess this function checks which cells
    // prevent a number from being placed and highlights them
    // using some css trickery
    var illegals = [];
    // check rows and columns
    for (var i = 0; i < 9; i++) {
        if (puzzle[x][i] == n) {
            illegals.push({x: x, y: i});
        }
        if (puzzle[i][y] == n) {
            illegals.push({x: i, y: y});
        }
    }
    // check square
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            var xx = 3*Math.floor(x/3)+i;
            var yy = 3*Math.floor(y/3)+j;
            if (puzzle[xx][yy] == n) {
                illegals.push({x: xx, y: yy})
            }
        }
    }
    for (var illegal of illegals) {
        sudoku.cellAt(illegal.x, illegal.y).classList.add("hl-illegal");
    }
    setTimeout(function (illegals) {
        for (var illegal of illegals) {
            sudoku.cellAt(illegal.x, illegal.y).classList.remove("hl-illegal");
        }
    }, 1000, illegals);
    return illegals.length === 0
}

function createSudoku() {
    // Generates an array of arrays representing a valid solution
    // to 9x9 sudoku.
    // Note: This does not generate truly random puzzles
    // because it's hard, but for now this is good
    // enough. A better way would be to use pre-generated
    // seed puzzles. Here I'm basically using only one seed
    // puzzle, but each seed puzzle has 5 806 080 variations
    // (although I don't think I'm using all of the variations here).
    puzzle = [];
    // generating seed puzzle
    var nums = shuffled(numbers);
    for (var i = 0; i < 3; i++) {
        nums = shiftLeft(nums, 1);
        puzzle.push(nums.slice());
        nums = shiftLeft(nums, 3);
        puzzle.push(nums.slice());
        nums = shiftLeft(nums, 3);
        puzzle.push(nums.slice());
    }
    // shuffle rows and columns to generate some chaos
    puzzle = shuffled(puzzle.slice(0,3))
        .concat(shuffled(puzzle.slice(3,6)))
        .concat(shuffled(puzzle.slice(6,9)));
    
    puzzle = rotatePuzzle(puzzle);
    puzzle = shuffled(puzzle.slice(0,3))
        .concat(shuffled(puzzle.slice(3,6)))
        .concat(shuffled(puzzle.slice(6,9)));
    // and select random rotation for good measure
    for (var i = 0; i < randomInt(0,3); i++) {
        puzzle = rotatePuzzle(puzzle);
    }
    return puzzle;
}

function playSound(elId) {
    // plays a sound or starts the playback from the beginning if
    // the sound was already playing. Parameter needs to be id of
    // a HTML5 audio element found in the html document.
    var audio = document.getElementById(elId);
    if (audio.paused) {
        audio.play();
    } else {
        audio.currentTime = 0;
    }
}

// connect buttons to their respective functions
document.getElementById("new-game").addEventListener("click", newGame);
document.getElementById("save-game").addEventListener("click", saveGame);
document.getElementById("load-game").addEventListener("click", requestLoadGame);

// listen for messages from the page that contains the iframe
window.addEventListener("message", function (e) {
    var msg = e.data;
    if (msg.messageType === "LOAD") {
        loadGame(msg.gameState);
    } else if (msg.messageType === "ERROR") {
        console.log("Error: "+msg.info);
    }
}, false);
