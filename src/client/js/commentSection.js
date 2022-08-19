const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const btn = form.querySelector("button");

const handleSubmit = (event) => {
    event.preventDefault();
    const textarea = form.querySelector("textarea");
    const text= textarea.value;
    const videoId = videoContainer.dataset.id;
    //페이지를 바꾸지않고 실시간으로 코멘트를 달고 싶으므로 fetch쓴다.
    fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        headers:{
            "Content-Type" : "application/json", 
        },
        body:JSON.stringify({text: "test", rating:"5/10"}),
      });
};
if (form) {
    form.addEventListener("submit", handleSubmit);
  }
