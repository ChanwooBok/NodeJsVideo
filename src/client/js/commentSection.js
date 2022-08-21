import "regenerator-runtime";

const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");



// const addComment = (text) => {
//     const videoComments = document.querySelector(".video__comments ul");
//     const newComment = document.createElement("li");
//     newComment.className = "video__comment";
//     const icon = document.createElement("i");
//     icon.className = "fas fa-comment";
//     const span = document.createElement("span");
//     span.innerText = ` ${text}`;
//     newComment.appendChild(icon);
//     newComment.appendChild(span);
//     videoComments.prepend(newComment);
//   };

const addComment = (text,id) => {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.dataset.id = id;
    newComment.className = "video__comment";
    const icon  = document.createElement("i");
    icon.className = "fas fa-comment";
    const span = document.createElement("span");
    span.innerText = `${text}`;
    const a = document.createElement("a");
    a.innerText = "❌";
    newComment.appendChild(icon);
    newComment.appendChild(span);
    

    //delete btn
    a.href= `/api/videos/${id}/delete`;


    newComment.appendChild(a);
    videoComments.prepend(newComment);

    const handleDelete = async() => {
        const commentId = newComment.dataset.id;
        
        const response = await fetch(`/api/videos/${commentId}/delete`, {
             method:"POST",
        });
        if(response.status == 201){
            console.log(response.status);
            videoComments.removeChild(newComment);
            console.log("제거완료");
        }
    }

    a.addEventListener("click",handleDelete);

}

const handleSubmit = async(event) => {
    
    event.preventDefault();
    const textarea = form.querySelector("textarea");
    const text= textarea.value;
    const videoId = videoContainer.dataset.id;
    //페이지를 바꾸지않고 실시간으로 코멘트를 달고 싶으므로 fetch쓴다.
    const response = await fetch(`/api/videos/${videoId}/comment`,{
        method:"POST",
        headers:{
            "Content-Type" : "application/json", 
        },
        body: JSON.stringify({text}),
    });
    if(response.status ==201){
        textarea.value = "";
        const {newCommentId} = await response.json();
        addComment(text,newCommentId);
    }
    textarea.value = ""; // 마지막엔 코멘트창 꺠끗이 비워주기.
   
};

if (form) {
    form.addEventListener("submit", handleSubmit);
  }
   