import "regenerator-runtime";

const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

let deleteBtns = document.querySelectorAll("#deleteBtn");



const addComment = (text,commentId) => {
    
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.dataset.id = commentId;
    newComment.className = "video__comment";
    const icon  = document.createElement("i");
    icon.className = "fas fa-comment";
    const textspan = document.createElement("span");
    textspan.innerText = `${text}`;

    const deleteSpan = document.createElement("span");
    deleteSpan.innerText = "🗑";
    deleteSpan.id ="deleteBtn";
    deleteSpan.className = "video__comment__deleteBtn";
    deleteSpan.addEventListener("click",handleDelete);


    newComment.appendChild(icon);
    newComment.appendChild(textspan);
    newComment.appendChild(deleteSpan);
    videoComments.prepend(newComment);

};

const handleSubmit = async(event) => {
    
    event.preventDefault();
    const textarea = form.querySelector("textarea");
    const text= textarea.value;
    const videoId = videoContainer.dataset.id;
    if(text ===""){
        return;
    }
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

const handleDelete = async(event)=> {
    const li = event.target.parentElement;
    const videoId = videoContainer.dataset.id;
    const {dataset : { id : commentId }} = li;
    li.remove();
    // await fetch(`/api/comments/${commentId}/${videoId}/delete`,{
    //     method:"DELETE",
    // });   ---> videoId 까지 넘겨서 await Comment.find( { video : id }) 로 코멘트를 찾아보려고 했으나, params으로 받는 id는 후자 변수뿐이었음.
    await fetch(`/api/comments/${commentId}/delete`, {
        method:"DELETE",    
    });
    console.log("완료");
}

if (form) {
    form.addEventListener("submit", handleSubmit);
  }

if (deleteBtns) {
    deleteBtns.forEach((deleteBtn) => {
      deleteBtn.addEventListener("click", handleDelete);
    });
  }