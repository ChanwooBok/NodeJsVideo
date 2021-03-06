import Video from "../models/Video";
import User from "../models/User";
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


//promise 방식 ( 코드가 순서대로 실행되서 가독성이 좋다 . )
export const home = async(req,res) => {
  try{
    const videos = await Video.find( {}).sort({createdAt : "desc" });
    return res.render("home", { pageTitle :  "Home" , videos });
  }catch(error){
    return res.render("server-error");
  }
}

export const watch = async(req, res) => {

  const { id } = req.params; // const id = req.param.id : video를 올릴 사람의 id
  
  //const video = await Video.findById(id);
  //const owner = await User.findById(video.owner); // video에 user의 _id를 owner로 저장함으로써 쉽게 owner를 찾을 수 있다.
  const video = await Video.findById(id).populate("owner");

  if(!video){
    return res.status(404).render("404", {pageTitle: "Video Not Found"});
  }
  
  return res.render("watch", { pageTitle: video.title , video  }); // owner를 pug template에 보내서 쓸 수 있도록 한다.
};
 
export const getEdit = async(req,res)=> {
  const {
    user:{ _id }
  } = req.session;

  const { id } = req.params;
  const video = await Video.findById(id);
  if(!video){
    return res.render("404", {pageTitle: "Video Not Found"});
  }

  // 비록 template에서 owner가 아니면 edit ,delete 버튼이 보이지 않도록 링크를 숨겼으나, 백엔드에서도 반드시 보호처리를 해야한다.
  if((String)(video.owner._id) !== (String)(_id)){ // typeof()로 검사해보면 각 object , string으로 타입이 달라 항상 다르다고 나오므로 통일시켜주기.
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
  const video = await Video.exists( { _id : id });
  if(!video){
    return res.status(404).render("404", {pageTitle: "Video Not Found"});
  }

  // 비록 template에서 owner가 아니면 edit ,delete 버튼이 보이지 않도록 링크를 숨겼으나, 백엔드에서도 반드시 보호처리를 해야한다.
  if((String)(video.owner._id) !== (String)(_id)){
    return res.status(403).redirect("/"); // 403 : 권한x
  }

  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags  : Video.formatHashtags(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req,res)=>{

  return res.render("upload" , {pageTitle : "Upload Video" });
}
export const postUpload = async(req,res)=> {
  const {
    user:{_id},
  }  = req.session; 
  const { path: fileUrl }  = req.file;
  const {title , description , hashtags } = req.body;
 try{
   const newVideo = await Video.create( {
    title , 
    description , 
    fileUrl,
    owner:_id,
    hashtags  : Video.formatHashtags(hashtags),
  });
  const user = await User.findById(_id);
  user.videos.push(newVideo._id); // 한명의 user는 여러개의 video를 가질 수 있다. 업로드할때마다 이렇게 추가해준다.
  user.save(); // 이렇게 user.save()하면 문제점 : 매번 비디오 올릴때마다 password hashing middleware가 발동해서 유저가 로그인을 실패하게된다.
  //-> 버그 해결책 : password가 변경되었을때만 middleware가 작동하도록 수정한다. 
 }catch(error){ 
    return res.status(404).render("upload", {
      pageTitle : "Upload Video",
      errorMessage : error._message,
    })
 }
  
  return res.redirect("/");
}


export const deleteVideo = async (req, res) => {
  const {
    user:{_id},
  } = req.session;

  const { id } = req.params;
  
  const video = await Video.findById(id);
  if(!video){
    return res.status(400).render("404",{pageTitle : "Video not Found"});
  }
  if((String)(video.owner._id) !== (String)(_id)){
    return res.status(403).redirect("/");
  }
  
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};


export const search = async(req,res) => {
  const { keyword } = req.query;
  let videos = [];
  if(keyword){
    videos = await Video.find({
      title: {
        $regex: new RegExp(`^${keyword}`, "i"),
      },
    })
  }
  return res.render("search", { pageTitle: "Search", videos });
}