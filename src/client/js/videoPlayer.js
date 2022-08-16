const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const time = document.getElementById("time");
const volumeRange = document.getElementById("volume");
const currenTime = document.getElementById("currenTime");
const totalTime = document.getElementById("totalTime");
const timeline =document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");


const handlePlayClick = (e) =>{
    if(video.paused){
        video.play();
    }else{
        video.pause();
    }
    playBtnIcon.classList = video.paused ?  "fas fa-play" : "fas fa-pause";
};

let volumeValue = 0.5;
video.volume = volumeValue;


const handleMuteClick = (e) => {
    if(video.muted){
        video.muted = false;
    }else{
        video.muted = true;
    }
    muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
    volumeRange.value = video.muted ? 0 : volumeValue;  
};

const handleVolumeChange = (e) => {
    const {
        target :{value},
     } = e;
     if(video.muted){
        video.muted = false;
        muteBtn.innerText = "Mute";
     }
    volumeValue =value;
    video.volume = volumeValue;
};

const formatTime = (seconds) =>
    new Date(seconds * 1000).toISOString().substr(14, 5);

const handleLoadedMetadata =  () =>{
    totalTime.innerText = formatTime(Math.floor(video.duration));
    timeline.max = Math.floor(video.duration);
}

const handleTimeUpdate = () => {
    currenTime.innerText = formatTime(Math.floor(video.currentTime));
    timeline.value = Math.floor(video.currentTime);
  };
  
const handleTimelineChange =  (e) => {
    const { target: { value}} = e;
    video.currentTime = value;
}

const handleFullScreen = () => {
    const fullscreen = document.fullscreenElement;
    if(fullscreen){
        document.exitFullscreen();
        fullScreenIcon.classList = "fas fa-expand";
    }else{
        videoContainer.requestFullscreen();
        fullScreenIcon.classList = "fas fa-compress";
    }
    
}

let controlsTimeout = null;
let controlsMovementTimeout = null;

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () =>{
    if(controlsTimeout){
        clearTimeout(controlsTimeout);
        controlsTimeout = null;
    } // 마우스가 화면 안과밖을 오고갈때 상황.
    if(controlsMovementTimeout){
        clearTimeout(controlsMovementTimeout);
        controlsMovementTimeout = null;
    }//마우스가 화면내에서 움직일 때 상황. 
    // 처음 마우스가 화면에 올 땐 실행되지 않음 (Null이므로) 그러고 다시 화면에서 마우스가 움직일때마다 매우 빠르게 기존의 controlsMovementTimeout을 clear하고 아래로 내려가서 새로운 timeout을 만들어낸다.
    
    videoControls.classList.add("showing");
    controlsMovementTimeout = setTimeout(hideControls,3000);  // 매번 마우스를 움직일 때 마다 timeout을 만들어준다.
};


const handleMouseLeave = () => {
    controlsTimeout = setTimeout(() => {
        hideControls
    }, 3000);
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);

video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
timeline.addEventListener("input",handleTimelineChange);
fullScreen.addEventListener("click",handleFullScreen);

video.addEventListener("mouseleave", handleMouseLeave);
video.addEventListener("mousemove", handleMouseMove);

//Register View
const handleEnded = () => {
    const {id} = videoContainer.dataset;
    fetch(`/api/videos/${id}/view`, {
        method:"POST",
    });
};

video.addEventListener("ended",handleEnded);

