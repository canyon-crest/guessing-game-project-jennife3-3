// global variables
let level, answer, score;
const levelArr = document.getElementsByName("level");
const scoreArr = [];
Date.textContent = time();
//add event listeners
playBtn.addEventListener("click", play);
guessBtn.addEventListener("click", makeGuess);


function play(){
    socre = 0; //sets score to 0 every new game
    playBtn.disabled = true;
    guessBtn.disabled = false;
    guess.disabled = false;
    for(let i=0; i<levelArr.length;i++){
        if(levelArr[i].checked){
            level = levelArr[i].value;
        }
        levelArr[i].disabled = true;
    }
    msg.textContent = "Guess a number from 1-" + level;
    answer = Math.floor(Math.random()*level)+1;
    guess.placeholder = "ex: " + answer;
    //give up button somewhere around here
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
}

}

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
    scoreArr.push(score);
    scoreArr.sort((a,b)=> a-b);
    let lb = document.getElementsByClassName("leaderboard");
    wins.textContent = "Total wins: " + scoreArr.length;
    let sum = 0;
    for(let i=0; i<scoreArr.length; i++){
        sum += scoreArr[i];
        if(i<lb.length){
            lb[i].textContent = scoreArr[i];
        }
    }
        let avg = sum/scoreArr.length;
        avvScore.textContent = "Average Score: " + avg.toFixed (3);
}
function time (){
    let d = new Date();
    d = d.getFullYear() + " " + d.getMonth()
    return d;
}