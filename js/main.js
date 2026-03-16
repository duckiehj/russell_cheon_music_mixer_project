console.log('JS file connected');

// Variables
const board = document.querySelector("#main-board");
const dropZones = document.querySelectorAll(".drop-zone");
const iconZone = document.querySelector("#icon-con");
const mainbox = document.querySelector("#main-box");

const chars = document.querySelectorAll(".band");

const playBtn = document.querySelector("#play-btn");
const rewindBtn = document.querySelector("#rew-btn");

const playIcon = document.querySelector("#play-icon");
const pauseIcon = document.querySelector("#pause-icon");
const volSlider = document.querySelector("#vol-slider");

const audioElements = [];

let dragItem = null;
let selected = null;
let audioNum = 0;


// Functions
function dragStart() {
   console.log(`you are dragging ${this.id}`);
   dragItem = this;
   setTimeout(visibleDrag,0);
}

function visibleDrag() {
    dragItem.classList.toggle("no-display");
}

function defPrevent(e) {
    e.preventDefault();
}

function showPreview() {
    this.classList.add("preview");
}

function dropAudio(e) {
    e.preventDefault();
    if (this.firstElementChild) return;
    console.log(`${dragItem.id} was dropped in the zone`);
    this.appendChild(dragItem);
    dragItem.classList.remove("icon");
    dragItem.classList.add("char");

    startAudio(dragItem);
}

function dropBack(e) {
    e.preventDefault();
    console.log(`${dragItem.id} was dropped back to start`);
    iconZone.appendChild(dragItem);
    dragItem.classList.remove("char");   
    dragItem.classList.add("icon"); 

    audioElements.forEach((elem) => {
        if(elem.id == `${dragItem.id}-audio`) {
            elem.remove();
            let i = audioElements.indexOf(elem);
            audioElements.splice(i,1);
        }
    })
}




function startAudio(elem) {
   let audioFile = elem.dataset.audio;
   if(!audioFile) return;
   let audioItem = document.createElement("audio");

   audioElements.push(audioItem);
   audioItem.style.display = "none";
   audioItem.loop = true;
   audioItem.src = `audio/${audioFile}`;
   audioItem.id = `${elem.id}-audio`;
   audioItem.load();
   audioItem.volume = volSlider.value/100;
   audioItem.play();
   
   mainbox.appendChild(audioItem);
}

function playPauseAudio() {
    audioElements.forEach((elem) => {
        if(elem.paused){
            elem.play();
            playIcon.classList.toggle("st7");
            pauseIcon.classList.toggle("st7");
        } else {
            elem.pause();
            playIcon.classList.toggle("st7");
            pauseIcon.classList.toggle("st7");
        }
    })
}

function rewindAudio() {
    audioElements.forEach((elem) => {
        elem.currentTime = 0;
    })
}

function setVolume() {
    audioElements.forEach((elem) => {
        elem.volume = volSlider.value/100;
    })
}

function clickBrighten() {
    rewindBtn.classList.toggle("clicked");
}

// Event Listener
chars.forEach((elem) => {
    elem.addEventListener("dragstart", dragStart);
    elem.addEventListener("dragend", visibleDrag);    
});

dropZones.forEach((elem) => {
    elem.addEventListener("dragover", defPrevent); 
    elem.addEventListener("dragenter", showPreview);
    elem.addEventListener("drop", dropAudio);
})

board.addEventListener("dragover", defPrevent);
board.addEventListener("drop", dropBack);

playBtn.addEventListener("click", playPauseAudio);
rewindBtn.addEventListener("click", rewindAudio);
volSlider.addEventListener("change", setVolume);

