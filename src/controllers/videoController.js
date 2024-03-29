import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";

 // callback function : 해당 함수를 제일 마지막에 실행시키도록 해준다. ( 코드의 가독성 떨어진다.) 
  // promise : async await  를 이용해서 javascript 가 await코드를 기다려준다. 순서대로 코드작동 ( 코드의 가독성 굿)
  

  // callback 방식
// export const home = (req, res) => {
//   Video.find( {} , (error, videos) => {
//     if(error){
//       return res.render("server-error");
//     }
//     return res.render("home" , {pageTitle : "home"  , videos });
//   });
//    // {} : serach terms : 비어있으면 모든 형식을 찾는다는것을 뜻함.
//    // error , docs 를 수신하는  function 이 생긴것이다.  
// };




// promise 방식 ( 코드가 순서대로 실행되서 가독성이 좋다 . )
export const home = async(req,res) => {
  
  const videos = await Video.find( {})
    .sort({createdAt : "desc" })
    .populate("owner");
  
  return res.render("home", { pageTitle :  "Home" , videos });
  
}

// export const home = (req,res) => {
//   console.log("first");
//   Video.find({}, (error,videos)=>{
//     if(error){
//       return res.render(f"server-error");
//     }
//     return res.render("home",{pageTitle:"Home",videos});
//   });
// }


export const watch = async (req, res) => {
  
  const { id } = req.params; // 해당 비디오의 id
  const video = await Video.findById(id).populate("owner").populate("comments");
    if (!video) {
      return res.status(404).render("404", { pageTitle: "Not found" });
    }
    return res.render("watch", { pageTitle: video.title, video });
  };
  
export const getEdit = async(req,res)=> {
  const {
      session : { 
        user : {_id},},} = req;

  const { id } = req.params; // watch.pug에서 edit누를때 video.id로 비디오의 id를 인자로 보내준다.
  const video = await Video.findById(id); //video object가 필요하므로, mongoose의 기능인 findById를 써준다. exists쓰면 안된다. 
  
  if(!video){
    return res.render("404", {pageTitle: "Video Not Found"});
  }//만약,url로 온 id로 비디오를 찾았는데 없다면 무한로딩되므로,  if문으로 에러처리를 해준다.

  // 비록 template에서 owner가 아니면 edit ,delete 버튼이 보이지 않도록 링크를 숨겼으나, 백엔드에서도 반드시 보호처리를 해야한다. (비디오의 주인이 아니면 수정 할 수 없게끔)
  if((String)(video.owner) !== (String)(_id)){ // typeof()로 검사해보면 각 object , string으로 타입이 달라 항상 다르다고 나오므로 통일시켜주기.
    req.flash("error","Not authorized");
    return res.status(403).redirect("/"); // 403 : 권한x
  }
  
  return res.render("edit", { pageTitle: `Edit: ${video.title}`, video });
};

export const postEdit  = async(req,res)=>{
  const {
    user:{_id},
  } = req.session;

  const { id } = req.params;
  const { title,description , hashtags } = req.body;

  //exists( __ : __ ) 는 true ,false 의 불리언값을 전달한다. 여기선 비디오가 존재하는지만 체크하는거니까(에러방지용) video object는 필요없어서 exists로
  //간단하게 체크해준다. exist()는 filter를 필요로 하며 any propeties of video can be filter
  const video = await Video.exists( { _id : id });
  
  if(!video){
    return res.status(404).render("404", {pageTitle: "Video Not Found"});
  }

  //비록 template에서 owner가 아니면 edit ,delete 버튼이 보이지 않도록 링크를 숨겼으나, 백엔드에서도 반드시 보호처리를 해야한다.
  if((String)(video.owner) !== (String)(_id)){
    req.flash("error","Not authorized");
    return res.status(403).redirect("/"); // 403 : 권한x
  }

  //mongoose의 기능중 하나인 findByIdAndUpdate를 이용한다.
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags  : Video.formatHashtags(hashtags),
  });
  req.flash("success","success");
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req,res)=>{

  return res.render("upload" , {pageTitle : "Upload Video" });
}
export const postUpload = async(req,res)=> {
  
  const { 
      session : {
        user: {_id}}
       } = req;
  const { video, thumb }  = req.files; // multer는 req.file을 제공해주는데 file에는 path가 있다.
  const {title,description,hashtags} = req.body;
  // await에서는 에러가 나면 자바스크립트는 멈춰버린다. 따라서 에러를 대비해서 try~catch문을 써준다.
  const isHeroku = process.env.NODE_ENV === "production";
  try{
    const newVideo = await Video.create({
      title,
      fileUrl: isHeroku ? video[0].location : video[0].path,
      thumbUrl : isHeroku ? thumb[0].location : thumb[0].path,
      description,
      hashtags: Video.formatHashtags(hashtags),
      owner: _id, // 업로드하는 사람의 id를 등록해준다.
    });
      const user = await User.findById(_id);
      user.videos.push(newVideo._id); // 한명의 user는 여러개의 video를 가질 수 있다. 업로드할때마다 이렇게 추가해준다.
      user.save(); // 이렇게 user.save()하면 문제점 : 매번 비디오 올릴때마다 password hashing middleware가 발동해서 유저가 로그인을 실패하게된다.
      //-> 버그 해결책 : password가 변경되었을때만 middleware가 작동하도록 수정한다. 
      req.flash("success","success");
      return res.redirect("/");
    }catch(error){
    return res.render("upload",{
      pageTitle:"Upload video",
      errorMessage:error._message,
    });
  }
}
export const deleteVideo = async (req, res) => {
  const {
    user:{_id},
  } = req.session;

  const { id } = req.params;

  const video = await Video.findById(id);
  const user = await User.findById(_id);

  if(!video){
    return res.status(400).render("404",{pageTitle : "Video not Found"});
  }
  if((String)(video.owner) !== (String)(_id)){
    return res.render(403);
  } 
  await Video.findByIdAndDelete(id); 
  //user에서는 비디오를 안 지워주고 있었다.. 실수
  user.videos.splice(user.videos.indexOf(id), 1);
  user.save();
  req.flash("success","success");
  return res.redirect("/");
};


export const search = async(req,res) => {
  const { keyword } = req.query;
  let videos = []; // 전역변수로 써먹기 위해 let으로 하고 빈 배열을 만들어준다. video를 찾을경우 수정될것이고 아닐경우 그대로 빈 배열일것.
  if(keyword){ // 우리가 검색한 단어 Keyword가 존재한다면 실행.
    videos = await Video.find({ 
      title: {
        $regex: new RegExp(`${keyword}$`, "i"), // ^xxx : xxx로 시작하는 단어 찾는다. // xxx$ : xxx로 끝나는 단어를 찾는다. // "i": 대소문자 구별 ignore
      },
    }).populate("owner");
  }
  return res.render("search", { pageTitle: "Search", videos });
}

export const registerView = async(req,res) => {
  const {id} = req.params;
  const video = await Video.findById(id);
  if(!video){  
    return res.sendStatus(404); // return res.status(404) 만 하면 무한로딩 한다. sendStatus해야 넘어간다.
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
  
}
export const createComment = async(req, res) => {
  const {
    session: { user : {_id} },
    body: { text },
    params: { id },
  } = req;
  const video = await Video.findById(id);
  const user = await User.findById(_id);

  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user,
    video: id,
  });
  //video모델에 comments넣어주기
  video.comments.push(comment._id);
  await video.save();
  //user모델에 comments넣어주기  
  user.comments.push(comment._id);
  await user.save();

  
  return res.status(201).json({newCommentId : comment._id});
};

export const deleteComment = async(req,res) => {
  const {
    params : { id : commentId }
  }  = req;
  const {
    session: { 
      user : { _id : userId},
    },
  } = req;
  const comment = await Comment.findById(commentId)
    .populate("owner")
    .populate("video"); // findById로 찾으면 comment의 _id로 찾아준다.
  //const comment = await Comment.find( { video : id }) // 불가능하네
  
  const video = comment.video;
  const user = await User.findById(userId);

  if( String(userId) !== String(comment.owner._id)){
    
    return res.sendStatus(404);
  }
  
  
  if (!video) {
    return res.sendStatus(404);
  }
  // console.log("comment : "+comment);
  // console.log("comment.video : "+video);
  //console.log(user); // comments : []로 나온다. 댓글을 생성할 때 user로 푸쉬를 안해주는듯. -> 해결완료.

//댓글 삭제, 비디오에서 댓글 배열 삭제, 유저에서 댓글 배열 삭제
user.comments.splice(user.comments.indexOf(commentId), 1);
await user.save();
video.comments.splice(video.comments.indexOf(commentId), 1);
await video.save();
await Comment.findByIdAndRemove(commentId);

  return res.end();
}

