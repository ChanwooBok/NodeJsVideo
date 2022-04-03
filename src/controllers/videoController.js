import Video from "../models/Video";

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
  const { id } = req.params; // const id = req.param.id
  const video = await Video.findById(id);
  if(!video){
    return res.render("404", {pageTitle: "Video Not Found"});
  }
  return res.render("watch", { pageTitle: `Watching hell yeah ` , video });
};
 
export const getEdit = async(req,res)=> {
  const { id } = req.params;
  const video = await Video.findById(id);
  if(!video){
    return res.render("404", {pageTitle: "Video Not Found"});
  }
  return res.render("edit", { pageTitle: `Edit: ${video.title}`, video });
};

export const postEdit  = async(req,res)=>{
  const { id } = req.params;
  const { title,description , hashtags } = req.body;
  const video = await Video.exists( { _id : id });
  if(!video){
    return res.render("404", {pageTitle: "Video Not Found"});
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
  const {title , description , hashtags } = req.body;
 try{
   await Video.create( {
    title , 
    description , 
    hashtags  : Video.formatHashtags(hashtags),
  });
 }catch(error){
    return res.render("upload", {
      pageTitle : "Upload Video",
      errorMessage : error._message,
    })
 }
  
  return res.redirect("/");
}


export const deleteVideo = async (req, res) => {
  const { id } = req.params;
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