console.log('JS file connected');

// Variables
const mixer = document.querySelector("#mixer");
const tray = document.querySelector("#tray");
const audio_icon = document.querySelectorAll(".audio-icon");

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
    console.log(`${dragItem.textContent} was dropped in the zone`);
    this.appendChild(dragItem);
}

// Event Listener
audio_icon.forEach((elem) => {
    elem.addEventListener("dragstart", dragStart);
    elem.addEventListener("dragend", visibleDrag);    
});

mixer.addEventListener("dragover", dragOver);
mixer.addEventListener("drop", appendDrag);
tray.addEventListener("dragover", dragOver);
tray.addEventListener("drop", appendDrag);
