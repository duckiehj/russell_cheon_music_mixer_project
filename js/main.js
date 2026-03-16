console.log('JS file connected');

// Variables
const song = document.querySelector("#song");
const mixer = document.querySelector("#mixer");
const tray = document.querySelector("#tray");
const dropZones = document.querySelectorAll(".height-1");
const audioIcon = document.querySelectorAll(".audio-icon");
const music = document.querySelector("#music-audio");

const playBtn = document.querySelector("#play-btn");
const stopBtn = document.querySelector("#stop-btn");
const rewindBtn = document.querySelector("#rewind-btn");


// functions
function dragStart() {
   console.log(`you are dragging ${this.textContent}`);
   dragItem = this;
   setTimeout(visibleDrag,0);
}

function visibleDrag() {
    dragItem.classList.toggle("hide");
}

function dragOver(e) {
    e.preventDefault();
}

function appendDrag() {
    if(dragItem.dataset.audioType != "song") {
        console.log("You can only drag DJs here");
        return
    };

    let item = song.firstElementChild;
    if(item) {
        tray.appendChild(item);
    };
    console.log(`${dragItem.id} was dropped in the zone`);
    this.appendChild(dragItem);
    music.src = `audio/${dragItem.dataset.audio}`;
    console.log(`${dragItem}`);
    music.load();
    console.log(`${music.src}`);
    music.play();
    playBtn.classList.remove("btn-pause");
    playBtn.classList.add("btn-play");
}

function soundDrag() {
    if(dragItem.dataset.audioType != "sound") {
        console.log("You can only drag band members here");
        return
    };

    console.log(`${dragItem.id} was dropped in the zone`);
    this.appendChild(dragItem);
}

function backDrag() {
    this.appendChild(dragItem);
    console.log(`${dragItem.id} was dragged back to the tray`);
    if(!song.firstElementChild) {
        stopAudio();
    }
}

function playAudio() {
    if(!song.firstElementChild) return;
    if(music.paused){
        music.play();
        playBtn.classList.remove("btn-pause");
        playBtn.classList.add("btn-play");
    } else {
        music.pause();
        playBtn.classList.remove("btn-play");
        playBtn.classList.add("btn-pause");
    }
}

function stopAudio() {
    music.pause();
    music.currentTime = 0;
    playBtn.classList.remove("btn-play");
    playBtn.classList.remove("btn-pause");
}

function rewindAudio() {
    music.currentTime -= 5;
}




// Event Listener
audioIcon.forEach((elem) => {
    elem.addEventListener("dragstart", dragStart);
    elem.addEventListener("dragend", visibleDrag);    
});

dropZones.forEach((elem) => {
    elem.addEventListener("dragover", dragOver); 
    elem.addEventListener("drop", dragOver); 
})



song.addEventListener("drop", appendDrag);
mixer.addEventListener("drop", soundDrag);
tray.addEventListener("drop", backDrag);

playBtn.addEventListener("click", playAudio);
stopBtn.addEventListener("click", stopAudio);
rewindBtn.addEventListener("click", rewindAudio);