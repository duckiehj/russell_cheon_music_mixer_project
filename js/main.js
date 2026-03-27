console.log('JS file be connected');

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

const speech = document.querySelector("#speech");
const mainGame = document.querySelector("#main-container")
const alertScr = document.querySelector("#alert");

const volumeCon = document.querySelector("#volume-con");
const buttonCon = document.querySelector("#btn-con");

const volSlider = document.querySelector("#vol-slider");
const volumeInd = document.querySelector("#volume-ind-bg");

const ambience = document.querySelector("#main-ambience");
const sfx = document.querySelector("#special-sfx");

const currentUnits = [];
const audioElements = [];

let unit = null;
let dragItem = null;
let previewItem = null;

let mainMusic = null;
let currentInstrument = null;

let selected = null;
let selectedAudio = null;

let timer = null;
let hasAnyAudioStarted = false;
let isAnyAudioSolo = false;
let gameState = 0;
let boardState = "instrument";

let dialogue = {
    primaryText:[
        speech.textContent,
        `Yarr! Now drag and drop ye the rest o' the crew!`,
        `Ye may command 'n belay the choir wit' those buttons and the slider.`,
        `Tap on an instrument or a crewman for direct commands. Drag'em back to the deck to swap.`,
        `A full crew means we'll be drinkin' some rum`,
        `Yohoho--- drink me hearties!🍾`],

    secondaryText: "",
    quickText: "",

    currentText: "",

    update: function() {
        if (dialogue.quickText !== "") {
            speech.innerHTML = dialogue.quickText;
            return;
        }

        if (dialogue.secondaryText !== "") {
            speech.innerHTML = dialogue.secondaryText;
            return;
        }

        if(gameState <= 3){
            this.currentText = this.primaryText[gameState];
        } else {
            if (currentUnits.length <  5)
                this.currentText = this.primaryText[4];
            else
                this.currentText = this.primaryText[5];
        }

        speech.innerHTML = this.currentText;
    },

    showQuickSpeech: function(text, emphasis=false) {
        this.quickText = text;
        this.update();

        if(emphasis){
            speech.classList.remove("emphText");
            speech.classList.add("emphText");
            void speech.offsetWidth;
        }

        if(timer) clearTimeout(timer);

        timer = setTimeout(() => {
            this.quickText = "";
            this.update();
            speech.classList.remove("emphText");
        }, 2500);
    }
}


// Functions
// save the item to a variable once dragged
function dragStart() {
   console.log(`ye be dragging ${this.id}`);
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
        dialogue.showQuickSpeech("Ye may only drop crews here");
        return;
    }

    hidePreview(e);
    appendAudio(this);
}

function dropMusic(e) {
    e.preventDefault();
    if(dragItem.classList.contains("band")){
        dialogue.showQuickSpeech("Ye may only drop instruments here");
        return;
    }

    // show the band member icons again
    appendAudio(this);
    
    mainDjCon.classList.remove("highlight");

    gameState++;

    if (!currentInstrument){
        currentInstrument = dragItem;
        showIconsByClass("band");
        currentInstrument.addEventListener("dragstart", dragInstrument);
        currentInstrument.addEventListener("dragend", dragInstrument);
        dialogue.showQuickSpeech(`Now be playing:<br><span class="subspeech">${currentInstrument.dataset.songName}</span>`);
    }

    if(selected==musicZone) {
        hideSpecificControls(e);
    }
}


function appendAudio(elem){
    if (elem.firstElementChild) return;
    console.log(`${dragItem.id} be in the water`);
    elem.appendChild(dragItem);
    
    dragItem.classList.remove("icon");
    dragItem.classList.add("obj");

    playAmbience();
    playSfx("water_drop.wav");

    startAudio(dragItem);
    pauseIcon.classList.remove("st7");
    playIcon.classList.add("st7");

    muteBtn.classList.remove("deactivated");
    soloBtn.classList.remove("deactivated");

    dragItem.addEventListener("click", showSpecificControls);

    //update the text, but only if they have ever started a song
    if(gameState > 0){
        gameState++;
        dialogue.update();
    }
}


// reverts the character to its icon once released back
function dropBack(e) {
    e.preventDefault();

    //prevents instrument and band icons together on the board
    if (iconZone.contains(dragItem)) return;
    if (!dragItem.classList.contains(boardState)) return;
    if (gameState < 2) return;

    //cancels selected and solo items
    if(dragItem == selected) {
        hideSpecificControls(e);
    };

    if(isAnyAudioSolo) {
        soloAudio();
    }

    console.log(`${dragItem.id} be back on deck`);
    dialogue.showQuickSpeech("They be back on the poop deck now.");
    iconZone.appendChild(dragItem);
    dragItem.classList.remove("obj");   
    dragItem.classList.add("icon");     

// makes this element not selectable anymore
    dragItem.removeEventListener("click", showSpecificControls);

// removes the unit from the unit list
    currentUnits.forEach((elem) => {
        if(elem == dragItem) {
            let i = currentUnits.indexOf(elem);
            if(i > -1)
                currentUnits.splice(i,1);
        }
    });
   
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
        audioItem.classList.add("instrument");
    } else {
        audioItem.classList.add("band");
    }

    mainbox.appendChild(audioItem);


    audioItem.loop = true;
    audioItem.src = `audio/${audioFile}`;
    audioItem.load();
    audioItem.volume = volSlider.value/100;
    audioItem.play();

    hasAnyAudioStarted = true;

    if(isAnyAudioSolo) {
        audioItem.muted = true;
        elem.classList.add("muted");
    }
    audioItem = null;
}

// this button does what the function says
function playPauseAudio() {
    // change icon to play if the audio is paused, and vice versa

    if(!hasAnyAudioStarted){
        audioElements.forEach((elem) => {
            elem.play();
        });

        hasAnyAudioStarted = true;

        playIcon.classList.add("st7");
        pauseIcon.classList.remove("st7");
        mainDj.classList.add("dj-playing");

        if(gameState > 0)
            dialogue.showQuickSpeech(`Aye aye, commence.`);
    } else {
        audioElements.forEach((elem) => {
            elem.pause();
        });
        
        hasAnyAudioStarted = false;

        playIcon.classList.remove("st7");
        pauseIcon.classList.add("st7");
        mainDj.classList.remove("dj-playing");

        if(gameState > 0)
            dialogue.showQuickSpeech(`Belay choir, ye.`);
    }
}

// restart and set volume to all audios
function rewindAudio() {
    dialogue.showQuickSpeech(`All hands, repeat.`);

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
        dialogue.showQuickSpeech("I can't hear YOOOU!");
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
            // trigger reflow and animation
            void selected.offsetWidth;
            selected.classList.add("emphasized");
            dialogue.showQuickSpeech("Tap on the back arrow button before ye command another", true);
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
        playSfx("selected.ogg");
    } else if (selected.classList.contains("band")){
        showIconsByClass("band");
    }

    dialogue.secondaryText = `Use the square thingy buttons to silent or to single them out. Tap on the back button when ye are done.`;
    console.log(`Now be selecting ${selected.id}`);

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
                console.log(`${selectedAudio.id} be found`);
                break;
            }
        }

        if(selectedAudio) {
            if(isAnyAudioSolo) {
                muteBtn.classList.add("deactivated");
            }
            if(selectedAudio.muted){
                muteIcon.classList.add("st3");
                unmuteIcon.classList.remove("st3");
            }
        }
    }

    dialogue.update();
}

function hideSpecificControls(e) {
    if(e.type == "click")
        showIconsByClass("band");

    volumeCon.classList.remove("hidden");
    buttonCon.classList.add("hidden");

    if(!selected) return;

    dialogue.secondaryText = "";
    dialogue.update();

    selected.classList.remove("selected");
    selected.classList.remove("emphasized");

    muteBtn.classList.remove("deactivated");
    soloBtn.classList.remove("deactivated");

    selected = null;
    selectedAudio = null;
}

// mute or solo audio 
function muteAudio() {
    if((!selectedAudio)||(isAnyAudioSolo)) return;
    if(!selectedAudio.muted){
        selectedAudio.muted = true;
        selected.classList.add("muted");
        console.log("selected audio is muted");

        muteIcon.classList.add("st3");
        unmuteIcon.classList.remove("st3");
    }
    else{
        selectedAudio.muted = false;
        selectedAudio.volume = volSlider.value/100;
        selected.classList.remove("muted");
        console.log("selected audio is unmuted");

        muteIcon.classList.remove("st3");
        unmuteIcon.classList.add("st3");
    }
}

// this one has the highest priority, even over mute
function soloAudio() {
    if(!selectedAudio) return;
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

        dialogue.showQuickSpeech(`A crewmate be promoted! Yarr...`, true);

        soloIcon.classList.add("st3");
        unsoloIcon.classList.remove("st3");

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

        console.log("selected audio be no longer singled");

        soloIcon.classList.remove("st3");
        unsoloIcon.classList.add("st3");

        muteIcon.classList.remove("st3");
        unmuteIcon.classList.add("st3");
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


function checkAspectRatio(e) {
    e.preventDefault();
    let uvOrent = screen.orientation.type;

    if(uvOrent == "portrait-primary"){
        alertScr.style.display = "grid";
        mainGame.style.display = "none";
    } else {
        alertScr.style.display = "none";
        mainGame.style.display = "flex";
    }
}


// Event Listeners
window.addEventListener("load", changeVolumeBar);
window.addEventListener("load", checkAspectRatio);
screen.orientation.addEventListener("change", checkAspectRatio);

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
