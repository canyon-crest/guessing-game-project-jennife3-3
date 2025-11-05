// global variables
let level, answer, score;
const levelArr = document.getElementsByName("level");
const scoreArr = [];
// DOM elements (cache these for clarity)
const dateEl = document.getElementById('date');
const playBtn = document.getElementById('playBtn');
const guessBtn = document.getElementById('guessBtn');
const guess = document.getElementById('guess');
const msg = document.getElementById('msg');
const wins = document.getElementById('wins');
const avgScore = document.getElementById('avgScore');
// name-first flow elements
const nameInput = document.getElementById('playerName');
const startBtn = document.getElementById('startBtn');
const playerDisplay = document.getElementById('playerDisplay');
let player = '';



// add event listeners
playBtn.addEventListener("click", play);
guessBtn.addEventListener("click", makeGuess);
startBtn.addEventListener('click', handleStart);
nameInput.addEventListener('input', onNameInput);

function onNameInput(){
    msg.textContent = "Welcome to the Guessing Game!";
    const val = nameInput.value.trim();
    const hasName = val !== '';
    if (hasName) {
        player = val;
        playerDisplay.textContent = `Player: ${player}`;
        msg.textContent = `Welcome ${player}`;
        // enable play and level selection
        playBtn.disabled = false;
        startBtn.disabled = false;
        for(let i=0; i<levelArr.length;i++){
            levelArr[i].disabled = false;
        }
    } else {
        player = '';
        playerDisplay.textContent = '';
        msg.textContent = 'Please enter name to start';
        // disable play and level selection
        playBtn.disabled = true;
        startBtn.disabled = true;
        guessBtn.disabled = true;
        guess.disabled = true;
        for(let i=0; i<levelArr.length;i++){
            levelArr[i].disabled = true;
        }
    }
}

function handleStart(){
    const entered = nameInput.value.trim();
    if (!entered) return;
    player = entered;
    // display the player's name and lock the name input
    playerDisplay.textContent = `Player: ${player}`;
    nameInput.disabled = true;
    startBtn.disabled = true;
    // Keep/ensure level selection and Play enabled
    for(let i=0; i<levelArr.length;i++){
        levelArr[i].disabled = false;
    }
    playBtn.disabled = false;
    msg.textContent = `Welcome ${player}`;
}

// lock the game UI until a name is entered
function lockUIBeforeName(){
    playBtn.disabled = true;
    guessBtn.disabled = true;
    guess.disabled = true;
    startBtn.disabled = true;
    for(let i=0; i<levelArr.length;i++){
        levelArr[i].disabled = true;
    }
    msg.textContent = 'Please enter name to start';
}

// initialize locked UI
lockUIBeforeName();

function play(){
    // initialize score for this round
    score = 0;
    playBtn.disabled = true;
    guessBtn.disabled = false;
    guess.disabled = false;
    for(let i=0; i<levelArr.length;i++){
        if(levelArr[i].checked){
            level = Number(levelArr[i].value);
        }
        levelArr[i].disabled = true;
    }
    msg.textContent = "Guess a number from 1-" + level;
    answer = Math.floor(Math.random()*level)+1;
    // don't reveal the answer in the placeholder for actual game-play
    guess.placeholder = "e.g. " + Math.floor(Math.random()*level+1);
}
function makeGuess(){
    let userGuess = parseInt(guess.value);
    if(isNaN(userGuess) || userGuess < 1 || userGuess > level){
        msg.textContent = "Enter a Valid #1-" + level;
        return;
    }
    score++; 
if (userGuess > answer) {
  msg.textContent = userGuess + " is too high! Try again.";
} 
else if (userGuess < answer) {
  msg.textContent = userGuess + " is too low! Try again.";
}
else {
  msg.textContent = userGuess + " is correct! You got it in " + score + " tries.";
  reset();
  updateScore();
}

}

// unified reset function
function reset(){
    guessBtn.disabled = true;
    guess.disabled = true;
    guess.value = "";
    guess.placeholder = "";
    playBtn.disabled = false;
    for(let i=0; i<levelArr.length; i++){
        levelArr[i].disabled = false;
    }
}
function updateScore(){
    scoreArr.push(score); //adds current score to array of scores
    wins.textContent = "Total wins: " + scoreArr.length;
    let sum = 0;
    scoreArr.sort((a,b) => a-b); //sorts accending
    //leaderboard?
    const lb = document.getElementsByName("leaderboard");
    for(let i=0; i<scoreArr.length; i++){
        sum += scoreArr[i];
        if(i<lb.length){
            lb[i].textContent = scoreArr[i];
        }
    }
    let avg = sum/scoreArr.length;
    avgScore.textContent = "Average Score: " + avg.toFixed(2);
}
// update the date/time display every second
function updateTime(){
const d = new Date();
const pad = (n) => String(n).padStart(2, '0');
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const fullMonthName = monthNames[d.getUTCMonth()];

const str = `${fullMonthName} ${pad(d.getDate())}, ${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
if (dateEl) dateEl.textContent = str;
}

// start the live clock
updateTime();
setInterval(updateTime, 1000);