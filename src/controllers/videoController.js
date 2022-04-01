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
    console.log("start");
    const videos = await Video.find( {});
    console.log(videos);
    console.log("finished");
    return res.render("home", { pageTitle :  "Home" , videos });
  }catch(error){
    return res.render("server-error");
  }
}

export const watch = (req, res) => {
  const { id } = req.params; // const id = req.param.id
  const video = videos[id - 1];
  
  return res.render("watch", { pageTitle: `Watching hell yeah `});
};

export const test = (req,res) => {
  return res.render("test");
}

export const getEdit = (req,res)=> {
  const { id } = req.params;
  return res.render("edit", { pageTitle: `Editing `  });
};

export const postEdit  = (req,res)=>{
  const { id } = req.params;
  const { title } = req.body;
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req,res)=>{
  return res.render("upload" , {pageTitle : "Upload Video" });
}
export const postUpload = async(req,res)=> {
  const {title , description , hashtags } = req.body;

  Video.create( {
    title , 
    description , 
    createdAt : Date.now(),
    hashtags : hashtags.split(",").map( ( word ) => `#${word}`),
    meta:{
      views: 0,
      rating: 0,
    },
  });
  
  return res.redirect("/");
}


