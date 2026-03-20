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
const returnBtn = document.querySelector("#return-btn");

const muteBtn = document.querySelector("#mute-btn");
const soloBtn = document.querySelector("#solo-btn");

const playIcon = document.querySelector("#play-icon");
const pauseIcon = document.querySelector("#pause-icon");

const muteIcon = document.querySelector("#muteIcon");
const unmuteIcon = document.querySelector("#unmuteIcon");
const soloIcon = document.querySelector("#soloIcon");
const unsoloIcon = document.querySelector("#unsoloIcon");

const volumeCon = document.querySelector("#volume-con");
const buttonCon = document.querySelector("#btn-con");

const volSlider = document.querySelector("#vol-slider");
const volumeInd = document.querySelector("#volume-ind-bg");

const ambience = document.querySelector("#main-ambience");
const sfx = document.querySelector("#special-sfx");

const currentUnits = [];
const audioElements = [];

let dragItem = null;
let previewItem = null;

let mainMusic = null;
let currentInstrument = null;

let selected = null;
let selectedAudio = null;

let hasAnyMusicStarted = false;
let isAnyAudioSolo = false;
let gameState = 0;
let boardState = "instrument";


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
    playSfx("water_drop.wav");
}

function dropMusic(e) {
    e.preventDefault();
    if(dragItem.classList.contains("band")){
        console.log("You can only drop instruments here");
        return;
    }

    // show the band member icons again
    appendAudio(this);
    playSfx("selected.ogg");
    mainDjCon.classList.remove("highlight");

    if(gameState == 0) gameState++;

    if (!currentInstrument){
        currentInstrument = dragItem;
        showIconsByClass("band");
        currentInstrument.addEventListener("dragstart", dragInstrument);
        currentInstrument.addEventListener("dragend", dragInstrument);
    }
}


function appendAudio(elem){
    if (elem.firstElementChild) return;
    console.log(`${dragItem.id} was dropped in the zone`);
    elem.appendChild(dragItem);
    
    dragItem.classList.remove("icon");
    dragItem.classList.add("obj");

    playAmbience();

    startAudio(dragItem);
    pauseIcon.classList.remove("st7");
    playIcon.classList.add("st7");

    muteBtn.classList.remove("deactivated");
    soloBtn.classList.remove("deactivated");

    dragItem.addEventListener("click", showSpecificControls);
}


// reverts the character to its icon once released back
function dropBack(e) {
    e.preventDefault();

    //prevents instrument and band icons together on the board
    if (!dragItem.classList.contains(boardState)) return;

    //cancels selected and solo items
    if(dragItem == selected) {
        hideSpecificControls(e);
    };

    if(isAnyAudioSolo) {
        soloAudio();
    }

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
   currentUnits.push(elem);

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
    if(isAnyAudioSolo) {
        audioItem.muted = true;
        elem.classList.add("muted");
    }
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
        if(elem.classList.contains("band"))
            elem.currentTime = 0;
        else
            elem.currentTime -= 5;
    })
}

function setVolume() {
    changeVolumeBar();
    audioElements.forEach((elem) => {
        elem.volume = volSlider.value/100;
    })
    console.log("volume is now: " + volSlider.value);
    if(volSlider.value == 0) {
        console.log("I can't hear YOOOU!");
    }
}

function changeVolumeBar() {
    volumeInd.setAttribute("width", volSlider.value*185/100);
}

function clickBrighten() {
    rewindBtn.classList.toggle("clicked");
}

// Animations for the DJ 
// (won't play if not an instrument dragged over)
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

// Displaying Icons Handlers
function showIconsByClass(type) {
    let currentIcons = iconZone.children;
    boardState = type;
    for(let i = 0; i < currentIcons.length; i++){
        if (currentIcons[i].classList.contains(type)) {
            currentIcons[i].classList.remove("no-display");
        }
        else {
            currentIcons[i].classList.add("no-display");
        } 
    }
}

// show instrument board if an instrument is dragged
// hide the instrument board again if the instrument is not dropped back
function dragInstrument(e) {
  if (e.type == "dragstart") {
    showIconsByClass("instrument");
  }

  if((e.type == "dragend") && (selected != currentInstrument)) {
    if(musicZone.contains(currentInstrument))
        showIconsByClass("band");
    else
        currentInstrument = null;
  }
}

// show or hide specific audio controls (mute/solo)
function showSpecificControls() {
    if(gameState == 0) return;

    // prevents user selecting another unit without pressing return
    if(selected) {
        if(!this.contains(selected)){
            selected.classList.remove("emphasized");
            // trigger reflow
            void selected.offsetWidth;
            selected.classList.add("emphasized");
            console.log("Click the return button before selecting another");
        }
        return; 
    }

    //assigns selected element: either it's the unit, or the DJ's zone itself
    selected = this.firstElementChild;
    if(!selected) selected = this;

    selected.classList.add("selected");

    // shows only its type (instruments/band members) on board
    if(selected.classList.contains("instrument")){
        showIconsByClass("instrument");
    } else if (selected.classList.contains("band")){
        showIconsByClass("band");
    }

    console.log(`Now selecting ${selected.id}`);

    // shows the new buttons in place of the volume slider
    volumeCon.classList.add("hidden");
    buttonCon.classList.remove("hidden");

    // for the DJ's zone without an instrument, these can't be clicked
    if(selected == musicZone) {
        muteBtn.classList.add("deactivated");
        soloBtn.classList.add("deactivated");
    } else {
        // for other units, find the associated audio
        for(let i=0; i < audioElements.length; i++){
            if(audioElements[i].id == `${selected.id}-audio`) {
                selectedAudio = audioElements[i];
                console.log(`${selectedAudio.id} is found`);
                break;
            }
        }
    }
}

function hideSpecificControls(e) {
    if(e.type == "click")
        showIconsByClass("band");

    volumeCon.classList.remove("hidden");
    buttonCon.classList.add("hidden");

    if(!selected) return;

    selected.classList.remove("selected");
    selected.classList.remove("emphasized");

    muteBtn.classList.remove("deactivated");
    soloBtn.classList.remove("deactivated");

    selected = null;
    selectedAudio = null;
}

// mute or solo audio 
function muteAudio() {
    if(!selectedAudio.muted){
        selectedAudio.muted = true;
        selected.classList.add("muted");
        console.log("selected audio is muted");

        muteIcon.classList.toggle("st3");
        unmuteIcon.classList.toggle("st3");
    }
    else{
        selectedAudio.muted = false;
        selectedAudio.volume = volSlider.value/100;
        selected.classList.remove("muted");
        console.log("selected audio is unmuted");

        muteIcon.classList.toggle("st3");
        unmuteIcon.classList.toggle("st3");
    }
}

// this one has the highest priority, even over mute
function soloAudio() {
    if(!isAnyAudioSolo){
        selectedAudio.muted = false;
        selectedAudio.volume = volSlider.value/100;
        selected.classList.remove("muted");

        for(let i=0; i < audioElements.length; i++){
            if(audioElements[i].id == `${selected.id}-audio`) {
                continue;
            }
            audioElements[i].muted = true;
        }

        isAnyAudioSolo = true;

        muteBtn.classList.add("deactivated");

        currentUnits.forEach((unit) => {
            if(unit != selected)
                unit.classList.add("muted");
        })

        console.log("selected audio is solo");

        soloIcon.classList.toggle("st3");
        unsoloIcon.classList.toggle("st3");

    } else {
        for(let i=0; i < audioElements.length; i++){
            audioElements[i].muted = false;
            audioElements[i].volume = volSlider.value/100;
        }
        isAnyAudioSolo = false;
        muteBtn.classList.remove("deactivated");

        currentUnits.forEach((unit) => {
            unit.classList.remove("muted");
        })

        console.log("selected audio is no longer solo");

        soloIcon.classList.toggle("st3");
        unsoloIcon.classList.toggle("st3");
    }
}

// Play random ambience sounds
function playAmbience() {
    if(currentUnits.length > 0) return;
    let randomNum = Math.floor(Math.random() * 3) + 1;
    ambience.src = `audio/ambience${randomNum}.mp3`;

    ambience.volume = volSlider.value/200;
    ambience.load();
    ambience.play();
}

function playSfx(file){
    sfx.src = `audio/${file}`;
    sfx.load();
    sfx.play();
}


// Event Listeners
window.addEventListener("load", changeVolumeBar);

dragUnits.forEach((elem) => {
    elem.addEventListener("dragstart", dragStart);
    elem.addEventListener("dragend", visibleDrag);    
});

dropZones.forEach((elem) => {
    elem.addEventListener("dragover", defPrevent); 
    elem.addEventListener("dragenter", showPreview);
    elem.addEventListener("dragleave", hidePreview);
    elem.addEventListener("drop", dropBand);
    //elem.addEventListener("click", showSpecificControls);
})

musicZone.addEventListener("dragover", defPrevent); 
musicZone.addEventListener("dragenter", playDjAnim); 
musicZone.addEventListener("dragleave", stopDjAnim); 
musicZone.addEventListener("drop", dropMusic);
musicZone.addEventListener("click", showSpecificControls);

returnBtn.addEventListener("click", hideSpecificControls);

board.addEventListener("dragover", defPrevent);
board.addEventListener("drop", dropBack);

playBtn.addEventListener("click", playPauseAudio);
rewindBtn.addEventListener("click", rewindAudio);
volSlider.addEventListener("change", setVolume);

muteBtn.addEventListener("click", muteAudio);
soloBtn.addEventListener("click", soloAudio);
