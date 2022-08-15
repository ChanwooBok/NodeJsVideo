const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volume = document.getElementById("volume");

const handleClick = (e) =>{
    if(video.paused){
        video.play();
    }else{
        video.pause();
    }
};


playBtn.addEventListener("click",handleClick);
video.addEventListener("mute",handlePause);