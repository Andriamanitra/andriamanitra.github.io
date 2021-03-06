document.getElementById("hitchButton").addEventListener("click", hitch);

var chancejs = new Chance();
const NICK_COLORS = ["#4C48B2", "#0000FF","#DC0000","#804ED4","#3300FF","#0068D0","#338000","#C93485","#007C93","#DA1C00","#DC0000","#B14E00"];
const MESSAGES = ["You'll never get a ride there!", "when did you last shower?", "hitchhiking is dangerous", "this is a terrible place to hitchhike", "you're standing too close to the white line", "it's illegal to hitchhike here", "lol", "it's illegal to hitchhike here", "&lt;message deleted&gt;", "will you come to $country??", "have you been to $country?", "where you going next?", "it's illegal to camp in the forest", "there are dangerous $animal here", "aren't you afraid of $animal?", "try to relax a little, your pose is way too aggressive", "your aggressive pose is scaring all the drivers", "hitchhiking is not safe", "did you ever turn a ride down?", "have you ever gotten a lift?", "no one picks up hitchhikers any more", "wtf why don't you have feet???", "put the content gloves on or you'll never be picked up", "there's a good dogging spot just down the road", "can we do a dogging stream tonight?", "i miss izzy", "trent you're such a bad hitchhiker", "where is blockhead?", "blockhead is always there watching", "my friend's cousin was actually eaten by a $animal in $country once, be careful out there", "let's go stay with Jerome again", "i think i saw a swisswatch lurking in the bush", "stream sniper!", "F", "f", "i think i hear dave's friends porsche approaching", "go to weatherspoons", "wetherspoons time", "wetherspoon tonight?", "this stream is so boring, i'll go watch josh play overwatch instead", "call a cab already", "why don't you just take uber?", "take a bus", "you truly can't do anything right hitch", "do you remember tom's balcony picture?", "you'll be late for your date with emepop", "how do you shower", "where do you sleep?", "what's your favorite country you've been in?", "you'll get arrested", "ask that cute girl's number", "do you ever meet girls when hitchhiking?", "Is that a spider behind you?", "do you have a gf?", "can i be your gf?", "show some skin", "you need a haircut", "I live nearby, I can drive you to the next town", "I used to live there, it's so surreal seeing it on stream!", "oh wow I live near there", "just give up already", "what's the scariest thing that happened to you while hitchhiking?", "they're driving too fast", "they can't stop there"];
var hitching = false;
var timer = 0;


setInterval(function() {
    timer += 1;
    updateTimer(timer);
    if (chancejs.bool({likelihood: 65}))
        chat();
}, 1000);

function updateTimer(n) {
    var date = new Date(null);
    date.setSeconds(n);
    var timeString = date.toISOString().substr(11, 8);
    document.getElementById("timer").innerHTML = timeString;
}

function getTime() {
    var currentdate = new Date();
    return currentdate.getHours()+":"+ ("0"+currentdate.getMinutes()).slice(-2);
}

function randomNick() {
    var part1 = chancejs.pickone([
        chancejs.word(),
        chancejs.capitalize(chancejs.word()),
        chancejs.animal(),
        chancejs.first(),
    ]);
    var part2 = chancejs.weighted(["", "_", chancejs.word()], [10, 3, 1]);
    var part3 = chancejs.pickone([
        chancejs.word(),
        chancejs.capitalize(chancejs.word()),
        chancejs.integer({min: 0, max: 99}),
        "420",
        "69",
        "666",
        ""
    ]);
    return (part1+part2+part3).replace(/\s/g,'');
}

function randomMessage() {
    var msg = chancejs.pickone(MESSAGES);
    msg = msg.replace("$country", chancejs.country({full: true}));
    msg = msg.replace("$animal", chancejs.animal().toLowerCase());
    return msg;
}

function chat() {
    var newLine = document.createElement("div");
    newLine.innerHTML = "<span class='timestamp'>"+getTime()+"</span>";
    newLine.innerHTML += "<span class='nick' style='color: "+chancejs.pickone(NICK_COLORS)+"'>" + randomNick() + "</span>";
    newLine.innerHTML += randomMessage();
    var chatDiv = document.getElementById("chat");
    chatDiv.appendChild(newLine);
    chatDiv.scrollTop = chatDiv.scrollHeight;
}

function hitch() {
    hitching = !hitching;
    document.getElementById("sign").classList.toggle('rotate');
    document.getElementById("thumb").classList.toggle('rotate');
    if (hitching) {
        timer = 0;
        updateTimer(timer);
        document.getElementById("timer").style.display = "block"
        document.getElementById("hitchButton").innerText = "Forget it!";
    }
    else {
        document.getElementById("timer").style.display = "none";
        document.getElementById("hitchButton").innerText = "Let's hitch!";
    }
}
