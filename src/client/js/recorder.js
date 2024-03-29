import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;



const files = {
    input: "recording.webm",
    output: "output.mp4",
    thumb: "thumbnail.jpg",
  };

const downloadFile = (fileUrl, fileName) => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
  };

const handleDownload = async () => {

    actionBtn.removeEventListener("click", handleDownload);

    actionBtn.innerText = "Transcoding...";

    actionBtn.disabled = true;

    const ffmpeg = createFFmpeg({ log: true }); // ffmpeg는 하나의소프트웨어이다. 이제부터 우리는 브라우저가 아닌 하나의 소프트웨어에서 움직인다고 생각. 자바스크립트는 너무느림

    await ffmpeg.load(); 
  
    ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));

    await ffmpeg.run("-i", files.input, "-r", "60", files.output);

    await ffmpeg.run(
        "-i",
        files.input,
        "-ss",
        "00:00:01",
        "-frames:v",
        "1",
        files.thumb
      );

  const mp4File = ffmpeg.FS("readFile", files.output);
  const thumbFile = ffmpeg.FS("readFile", files.thumb);


  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  downloadFile(mp4Url, "MyRecording.mp4");
  downloadFile(thumbUrl, "MyThumbnail.jpg");

  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumb);

    URL.revokeObjectURL(mp4Url);
    URL.revokeObjectURL(thumbUrl);
    URL.revokeObjectURL(videoFile);

    actionBtn.disabled = false;
    actionBtn.innerText = "Record Again";
    actionBtn.addEventListener("click", handleStart);

};

// const handleStop = () => {
//     actionBtn.innerText = "Download Recording";
//     actionBtn.removeEventListener("click",handleStop);
//     actionBtn.addEventListener("click", handleDownload);
//     recorder.stop();
// }

const handleStart = () => {
        
        actionBtn.innerText = "Recording";
        actionBtn.disabled = true;
        actionBtn.removeEventListener("click",handleStart);

        recorder = new MediaRecorder(stream, {mimeType : "video/webm"});
        recorder.ondataavailable = (event) => {
            videoFile = URL.createObjectURL(event.data);
            video.srcObject = null;
            video.src = videoFile;
            video.loop = true;
            video.play();
            // video가 플레이된후 recorder.stop() setTimeout5초때문에 자동으로 끝나고 아래 코드가 이제 실행된다.
            actionBtn.innerText = "Donwload";
            actionBtn.disabled = false;
            actionBtn.addEventListener("click", handleDownload);
        };
        recorder.start();

        //Record버튼을 누르면 5초가 카운트되고 자동으로 정지한다. 그리고 97번째 코드부터 실행된다.
        setTimeout(() => {
            recorder.stop();
          }, 5000); // video.play()된 후로 5초 카운트 다운
    };


const init = async() => {
    stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            width: 1024,
            height: 576,
          },
      });
      video.srcObject = stream;
      video.play();
}

init();

actionBtn.addEventListener("click",handleStart);
