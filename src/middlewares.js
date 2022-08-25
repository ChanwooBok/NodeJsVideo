import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const isHeroku = process.env.NODE_ENV === "production";

//s3 object를 만들기 : https://www.npmjs.com/package/multer-s3 링크 참조 하여 object 생성.
const s3 = new aws.S3({
    credentials : {
        accessKeyId : process.env.AWS_ID,
        secretAccessKey : process.env.AWS_SECRET
    }
});

const s3ImageUpload = multerS3({
    s3:s3,
    bucket:"healthips/images",
    acl:"public-read",
});

const s3VideoUploader = multerS3({
    s3:s3,
    bucket:"healthips/videos",
    acl:"public-read",
});

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
export const avatarUpload = multer({ 
    dest: "uploads/avatars",
    limits: {
        fileSize: 3000000,
    },
    storage:isHeroku ? s3ImageUpload : undefined,
});

export const videoUpload = multer({
    dest: "uploads/videos/",
    limits: {   
      fileSize: 1000000000,
    },
    storage:isHeroku ? s3VideoUploader : undefined,
  });
