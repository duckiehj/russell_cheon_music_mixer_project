console.log('JS file connected');

// Variables
const board = document.querySelector("#main-board");
const dropZones = document.querySelectorAll(".drop-zone");
const iconZone = document.querySelector("#icon-con");
const mainbox = document.querySelector("body");

const dragUnits = document.querySelectorAll(".dragunit");

const musicZone = document.querySelector("#music-dz");
const mainDj = document.querySelector("#main-dj");
const mainDjCon = document.querySelector("#main-dj-dz");

const playBtn = document.querySelector("#play-btn");
const rewindBtn = document.querySelector("#rew-btn");

const playIcon = document.querySelector("#play-icon");
const pauseIcon = document.querySelector("#pause-icon");
const volSlider = document.querySelector("#vol-slider");
const volumeInd = document.querySelector("#volume-ind-bg");

const audioElements = [];

let mainMusic = null;

let dragItem = null;
let previewItem = null;
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
    if(dragItem.classList.contains("instrument")) return;
    if(this.firstElementChild) return;
    previewItem = document.createElement("span");
    previewItem.id = `${dragItem.id}-preview`;
    previewItem.classList.add("obj");
    previewItem.classList.add("preview");
    this.appendChild(previewItem);
}

function hidePreview(e) {
    e.preventDefault();
    if(previewItem){
        previewItem.remove();
        console.log(`removed ${previewItem.id}`);      
        previewItem = null;  
    }

}

// attach the icon into the drop zone and change it to the character
function dropBand(e) {
    e.preventDefault();
    if(dragItem.classList.contains("instrument")){
        console.log("You can only drop band members here");
        return;
    }

    hidePreview(e);
    appendAudio(this);
}

function dropMusic(e) {
    e.preventDefault();
    if(dragItem.classList.contains("band")){
        console.log("You can only drop instruments here");
        return;
    }
    appendAudio(this);
    mainDjCon.classList.remove("highlight");
}


function appendAudio(elem){
    if (elem.firstElementChild) return;
    console.log(`${dragItem.id} was dropped in the zone`);
    elem.appendChild(dragItem);
    
    dragItem.classList.remove("icon");
    dragItem.classList.add("obj");

    startAudio(dragItem);
    pauseIcon.classList.remove("st7");
    playIcon.classList.add("st7");
}


// revert the character to its icon once released back
function dropBack(e) {
    e.preventDefault();
    //console.log(`${dragItem.id} was dropped back to start`);
    iconZone.appendChild(dragItem);
    dragItem.classList.remove("obj");   
    dragItem.classList.add("icon"); 

    
   
// removes that audio layer for good
    audioElements.forEach((elem) => {
        if(elem.id == `${dragItem.id}-audio`) {
            let i = audioElements.indexOf(elem);
            if (elem == mainMusic) {
                mainMusic = null;
                mainDj.classList.remove("dj-playing");
            }
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

   let audioItem = null;
   
    audioItem = document.createElement("audio");
    audioElements.push(audioItem);
    audioItem.id = `${elem.id}-audio`;

    if(elem.classList.contains("instrument")){
        mainMusic = audioItem;
    }

    mainbox.appendChild(audioItem);


   audioItem.style.display = "none";
   audioItem.loop = true;
   audioItem.src = `audio/${audioFile}`;
   audioItem.load();
   audioItem.volume = volSlider.value/100;
   audioItem.play();
   audioItem = null;
}

// this button does what the function says
function playPauseAudio() {
    audioElements.forEach((elem) => {
       // change icon to play if the audio is paused, and vice versa
        if(elem.paused){
            elem.play(); 
            playIcon.classList.add("st7");
            pauseIcon.classList.remove("st7");
            mainDj.classList.add("dj-playing");
        } else {
            elem.pause();
            playIcon.classList.remove("st7");
            pauseIcon.classList.add("st7");
            mainDj.classList.remove("dj-playing");
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

// Animations for the DJ
function playDjAnim() {
    if(dragItem.classList.contains("band")) return;
    if(musicZone.firstElementChild) return;
    mainDj.classList.add("dj-playing");
    mainDjCon.classList.add("highlight");
}

function stopDjAnim() {
    if(dragItem.classList.contains("band")) return;
    if(musicZone.firstElementChild) return;
    mainDj.classList.remove("dj-playing");
    mainDjCon.classList.remove("highlight");
}

// Event Listener

dragUnits.forEach((elem) => {
    elem.addEventListener("dragstart", dragStart);
    elem.addEventListener("dragend", visibleDrag);    
});

dropZones.forEach((elem) => {
    elem.addEventListener("dragover", defPrevent); 
    elem.addEventListener("dragenter", showPreview);
    elem.addEventListener("dragleave", hidePreview);
    elem.addEventListener("drop", dropBand);
})

musicZone.addEventListener("dragover", defPrevent); 
musicZone.addEventListener("dragenter", playDjAnim); 
musicZone.addEventListener("dragleave", stopDjAnim); 
musicZone.addEventListener("drop", dropMusic);

board.addEventListener("dragover", defPrevent);
board.addEventListener("drop", dropBack);

playBtn.addEventListener("click", playPauseAudio);
rewindBtn.addEventListener("click", rewindAudio);
volSlider.addEventListener("change", setVolume);

window.addEventListener("load", changeVolumeBar);