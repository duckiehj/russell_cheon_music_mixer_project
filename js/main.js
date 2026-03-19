console.log('JS file connected');

// Variables
const board = document.querySelector("#main-board");
const dropZones = document.querySelectorAll(".drop-zone");
const iconZone = document.querySelector("#icon-con");
const mainbox = document.querySelector("body");

const chars = document.querySelectorAll(".band");

const playBtn = document.querySelector("#play-btn");
const rewindBtn = document.querySelector("#rew-btn");

const playIcon = document.querySelector("#play-icon");
const pauseIcon = document.querySelector("#pause-icon");
const volSlider = document.querySelector("#vol-slider");

const volumeInd = document.querySelector("#volume-ind-bg");

const audioElements = [];

let dragItem = null;
let selected = null;
let audioNum = 0;



// Functions
// save the item to a variable once dragged
function dragStart() {
   console.log(`you are dragging ${this.id}`);
   dragItem = this;
   setTimeout(visibleDrag,0);
}

// temporarily hide the dragged item in the original box
function visibleDrag() {
    dragItem.classList.toggle("no-display");
}

// prevent default behaviors of the dragover event
function defPrevent(e) {
    e.preventDefault();
}

// show a preview of the character on dragover
function showPreview() {
    this.classList.add("preview");
}

// attach the icon into the drop zone and change it to the character
function dropAudio(e) {
    e.preventDefault();
    if (this.firstElementChild) return;
    console.log(`${dragItem.id} was dropped in the zone`);
    this.appendChild(dragItem);
    dragItem.classList.remove("icon");
    dragItem.classList.add("char");

    startAudio(dragItem);
    pauseIcon.classList.remove("st7");
    playIcon.classList.add("st7");
    
}

// revert the character to its icon once released back
function dropBack(e) {
    e.preventDefault();
    //console.log(`${dragItem.id} was dropped back to start`);
    iconZone.appendChild(dragItem);
    dragItem.classList.remove("char");   
    dragItem.classList.add("icon"); 

    
   
// removes that audio layer for good
    audioElements.forEach((elem) => {
        if(elem.id == `${dragItem.id}-audio`) {
            let i = audioElements.indexOf(elem);
            elem.remove();
            if (i > -1)
                audioElements.splice(i,1);
        }
    })

    if (audioElements.length == 0) {
       pauseIcon.classList.add("st7");
       playIcon.classList.remove("st7");
    }
}



// add a new audio layer for a character on drop zone
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

// this button does what the function says
function playPauseAudio() {
    audioElements.forEach((elem) => {
       // change icon to play if the audio is paused, and vice versa
        if(elem.paused){
            elem.play();
            playIcon.classList.add("st7");
            pauseIcon.classList.remove("st7");
        } else {
            elem.pause();
            playIcon.classList.remove("st7");
            pauseIcon.classList.add("st7");
        }
    })
}

// restart and set volume to all audios
function rewindAudio() {
    audioElements.forEach((elem) => {
        elem.currentTime = 0;
    })
}

function setVolume() {
    changeVolumeBar();
    audioElements.forEach((elem) => {
        elem.volume = volSlider.value/100;
    })
    console.log("volume is now: " + volSlider.value);
}

function changeVolumeBar() {
    volumeInd.setAttribute("width", volSlider.value*185/100);
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

window.addEventListener("load", changeVolumeBar);