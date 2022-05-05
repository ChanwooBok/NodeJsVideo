export const localMiddleware = (req,res,next) => {
    
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName = "Wetube";
    res.locals.loggedInUser = req.session.user || {};
    console.log(res.locals);
    next();
}

// 로그인 되어있는 유저만 접근 할 수 있는 페이지를 설정하기 위함.
export const protectorMiddleware = (req,res,next) => {
    if(req.session.loggedIn){
        next();
    }else{
        res.redirect("/login");
    }
}

export const publicOnlyMiddleware = (req,res,next) => {
    if(!req.session.loggedIn){
        next();
    }else{
        res.redirect("/")
    }
}

