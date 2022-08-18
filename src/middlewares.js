import multer from "multer";


export const localsMiddleware = (req,res,next) => {
    
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName = "healthips";
    res.locals.loggedInUser = req.session.user || {}; // 로그인이 안된상태에서 /users/edit으로 들어오면 loggedInUser세션값이 undefined오류가 난다. 그러므로 loggedInUser는 {} 일수도 있다고 바꿔주기.
    next();
}

// 로그인 되어있는 유저만 접근 할 수 있게끔 보호
export const protectorMiddleware = (req,res,next) => {
    if(req.session.loggedIn){
        next(); 
    }else{
        req.flash("error", "Log in first.");
        res.redirect("/login");
    }
}

//로그인 되어있지 않은 유저만 접근 할 수 있게끔 보호
export const publicOnlyMiddleware = (req,res,next) => {
    if(!req.session.loggedIn){
        next();
    }else{
        req.flash("error","not authorized");
        res.redirect("/")
    }
}


// // 사용자가 저장한 프로필 사진 파일을 uplaods/avatar라는 폴더에 저장하도록 하는 미들웨어.
export const avatarUpload = multer({ dest: "uploads/avatars" });

export const videoUpload = multer({
    dest: "uploads/videos/",
    limits: {
      fileSize: 1000000000,
    },
  });
