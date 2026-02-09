console.log('JS file connected');

// Variables
const mixer = document.querySelector("#mixer");
const tray = document.querySelector("#tray");
const audio_icon = document.querySelectorAll(".audio-icon");

// Event Listener
for(i = 0; i < audio_icon.length; i++) {
    //console.log(audio_icon[i].innerHTML);
    audio_icon[i].addEventListener("dragstart", dragStart);
}



function dragStart(e) {
   console.log(`you are dragging ${this.textContent}`);
}
