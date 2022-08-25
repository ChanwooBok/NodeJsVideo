import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req,res)=> {res.render("join");}
export const postJoin =  async(req,res) => {
    
    const { name , username ,password,password2, email , location } = req.body;
    const pageTitle = "Join";

    if (password !== password2) {
        return res.status(400).render("join", {
          pageTitle,
          errorMessage: "Password confirmation does not match.",
        });
      } 

    //const exists = await User.exists( {username , email }); // 이 경우 username,email 모두 겹치는것만 잡아낸다.
    // 근데 우리는 username, 혹은 email 중 하나라도 중복되면 잡아내야 하므로 $or 연산자를 쓴다.
    
    const exists=  await User.exists( { $or : [ {username : username} , {email : email}]});
    // $or : 인자들 중에 하나라도 true면 true 를 반환한다.
    if(exists){
        return res.status(400).render("join",{
            pageTitle,
            errorMessage: "This  username/email is already taken ",
        });
    }

    try{
    await User.create({
        name,
        email,
        username,
        location,
        password,
    });
    return res.redirect("/login");
    }catch(error){
        return res.status(400).render("join", {
            pageTitle: "join",
            errorMessage: error._message,
          });
    }
}
export const getEdit=  (req,res)=> {
    res.render("edit-profile" , {pageTitle : "Edit profile"})
}


export const postEdit = async(req,res) =>{
    const { 
            session : {
                user : {_id, avatarUrl},
            },
            body : { name, email , username , location },
            file,
         } = req;
    // const id = req.session.user.id; 와 같은 표현
    //console.log(file); multer s3를 시용할때는, File.location ,사용 안 할땐, File.path
    const isHeroku = process.env.NODE_ENV === "production";
    const updatedUser = await User.findByIdAndUpdate(
        _id,
        {
          avatarUrl : file ? ( isHeroku ?  file.location : file.path ) : avatarUrl , 
          name,
          email,
          username,
          location,
        },
        { new: true }
      );
      req.session.user = updatedUser;

    return res.render("edit-profile");
}
        
// export const postEdit = async(req,res) =>{
//     const {
//         session : {
//             user: {_id, avatarUrl},
//         },
//         body : { name,username,location, email},
//         file,   // const file = req.file;  ---> multer가 제공함. ( middleware로 dest를 지정해서 파일을 저장)
//         } = req;
    
//     // session의 username, email 과 정보가 같다면 중복체크해야한다.
//     const findUsername =  await User.findOne({username});
//     const findEmail = await User.findOne({email});

//     // 현재 세션에 저장된 _id와 일치하지 않는다는건 다른유저가 이미 username,email을 쓰고있다는뜻이다. 
//     if(findUsername._id != _id || findEmail._id != _id){
//         return res.render("edit-profile" , {
//             pageTitle : "Edit profile",
//             errorMessage:"this username / email is already taken",
//         });
//     }

//     const updatedUser = await User.findByIdAndUpdate(_id , {
//         avatarUrl : file ? file.path : avatarUrl,
//         name ,  
//         email,
//         username ,
//         location,
//     } , {new : true}  // findByIdAndUpdate의 기본값은 업뎃되지 않은 기존의 user를 가져온다 따라서, 
//     // 새롭게 업뎃한 값을 가져오기 위해서 해당 속성을 준다. 
//     );
//     req.session.user = updatedUser; // db뿐 아니라 ,세션의 user도 업데이트해주어야 pug에 나타나는 값도 바뀐다.
    
//     return res.render("edit-profile");
// }


export const remove = (req,res)=> {res.send("remove");}
export const getLogin = (req,res)=> {res.render("login" , {pageTitle:"Login"});}

export const postLogin = async(req,res) => {
    const {username , password } = req.body;
    const pageTitle = "login";
    //ID체크
    const user = await User.findOne( { username  : username  , socialOnly : false});
    if(!user){
        return res.status(400).render("login" , {
            pageTitle,
            errorMessage : "this username / password is not right ",
        })
    }
    //password체크
    const ok = await bcrypt.compare(password, user.password);
    if(!ok){
        return res.status(400).render("login",{
            pageTitle,
            errorMessage: "Wrong password",
        })
    }

    req.session.loggedIn = true;
    req.session.user = user; // session의 user라는 항목에 user라는 Object를 저장한다. 나중에 user의 id,name등 가져다 쓸모가 많음.
    res.redirect("/");
}
    
export const startGithubLogin = (req,res) => {

    const baseUrl = "https://github.com/login/oauth/authorize" // user를 해당 url로 보낸다.
    const config = {
        client_id : process.env.GH_CLIENT, // 깃허브에서 새로만든 아이디
        allow_signup : false, // 깃허브 페이지에서 따로 회원가입은 하지 못하게 한다. 
        scope: "read:user user:email" // 접근 할 수 있는 범위를 정해준다. 
    };
    const params = new URLSearchParams(config).toString(); // client_id=eac0ddda918a567d47e9&allow_signup=false&scope=read%3Auser+user%3Aemail
    //간편하게 url을 조합해준다.
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
   
}

//Authorize를 눌렀을때 post요청하는 기능
export const finishGithubLogin = async(req,res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id : process.env.GH_CLIENT,
        client_secret : process.env.GH_SECRET,
        code: req.query.code,
    }

    const params = new URLSearchParams(config).toString(); // 인자들을 합쳐서 하나의 인자로 만듦.
    const finalUrl = `${baseUrl}?${params}`;

    //access_token 받기
    const tokenRequest = await (
        await fetch(finalUrl, { // fetch는 Node에선 작동하지 않아서 node-fetch라는 것을 설치하였다.
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        })
      ).json(); // 받아온 정보를 json object로 추출함.
      if ("access_token" in tokenRequest) {
          //깃허브에서 건네준 access_token으로 scope에서 정한 원하는 정보의 범위내에서만 정보를 받을 수 있다( ex. scope: "read:user user:email" )
        const { access_token } = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await (
          await fetch(`${apiUrl}/user`, {
            headers: {
              Authorization: `token ${access_token}`, // access_token을 인자로 보내야 한다.
            },
          })
        ).json();
        const emailData = await( 
            await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json(); // await를 2번 겹쳐써서 then으로 복잡해질 것을 간소화 시켰다. 
         // emailData를 가져올 수 있는 이유는 startGithubLogin에서 scope를 user:email로 적어주었기 때문이다.
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true 
            ); // emailData는 모든 email을 다 불러와버리므로 조건을 지정해서 내가 원하는 이메일만 가져오도록 한다. 
        // if(!emailObj){
        //     return res.redirect("/login");
        // } // 일치하는 이메일이 없으면  로그인 창으로 돌려보낸다. 
        let user = await User.findOne( {emaiL : emailObj.emaiL });
        // 가입된 계정중에서 깃허브 계정이메일과 일치하는 유저가 존재하면 로그인 시켜준다. 

        // 깃허브 계정이메일과 일치하는 메일이 없으면 새롭게 계정을 생성해준다. 단, 이때 비밀번호는 없이 게정만으로 로그인 할 수 있다. 
        if(!user){
            user=  await User.create({
            avatarUrl: userData.avatar_url,
                name : userData.name,
                username : userData.login,
                email : emailObj.email,
                password: "",
                socialOnly : true, // 소셜로그인한 유저를 구분하기 위함. 이들은 로그인 할 때 비밀번호를 입력할 필요가 없음.
                location: userData.location,
            });
        }
            
        req.session.loggedIn = true;
        req.session.user=  user;
        return res.redirect("/");
      } else {
        return res.redirect("/login");
      }
      // 만약 우리 사이트에서 회원가입한 이메일주소가 깃허브에도 존재한다면 그냥 비밀번호 없이 로그인 하게 해준다. 단,socialOnly는 false이다.
    };

export const logout = (req,res)=> {
    req.session.destroy();  //세션은 지워지는데 쿠키는 안지워지네..?
    return res.redirect("/");
};

// export const getChangePassword = (req,res) => {
//     if(req.session.user.socialOnly){
//         return res.redirect("/");
//     }// 소셜계정으로 로그인 한 유저는 비밀번호가 없음.
//     return res.render("users/change-password", {
//         pageTitle :"Change password"
//     },);
// }

export const getChangePassword = (req,res) => { 
    if(req.session.socialOnly){
        return res.redirect("/");
    }
    return res.render("users/change-password", {
        pageTitle:"Change Password"
    });
}

export const postChangePassword = async(req,res) => {

    const { 
        session : {
        user : { _id} ,
        },
        body : {oldPassword, newPassword, newPasswordConfirmation }
        } = req;
    
    const user = await User.findById(_id); // user를 찾아놓아야함.
    const ok = await bcrypt.compare(oldPassword , user.password); // 현재 비밀번호 일치 여부 확인
    // 세션에도 password가 있으나 이는 일일이 비번변경시 세션비번도 업뎃해줘야하는 번거로움이 존재한다.

    if(!ok){
        return res.render("change-password", {
            pageTitle:"change password",
            errorMessage: "password is not correct"
        });
    }

    //새로운 비밀번호 재확인 일치여부.
    if(newPassword !=newPasswordConfirmation){
        return res.status(400).render("users/change-password", {
            pageTitle : "change password" ,
            errorMessage:"password doesn't match confirmation"
        });
    }
    
    //update password
    user.password = newPassword;
    await user.save(); // save()작업을 해주어야 save() middleware가  작동해서 비밀번호를 해시처리한다.
    return res.redirect("/users/logout");
} 
export const see = async(req,res)=> {

    const {id} = req.params;
    // const user=  await User.findById(id);
    //const user = await User.findById(id).populate("videos");
    //user schema에는 videos라는 항목이 있는데 이것은 ref: Video로 지정해줘서 Video schema에 연동된것을 노드가 몽구스가 알고 있다.
    // 따라서 populate를 해주면 해당 video를 연동해서 상세한 값들을 가져온다. ( title , fielUrl,  description...etc)
    const user = await User.findById(id).populate({
        path: "videos",
        populate: {
          path: "owner",
          model: "User",
        },
      });
    
    if(!user){
        return res.status(404).render("404", {pageTitle : "User Not found"});
    }
    //const videos = await Video.find( {owner  : user._id}); // video의 속성 중 owner가 _id인 video만 찾아온다.
    return res.render("users/profile", {
        pageTitle : user.name,
        user, // profile.pug에 user를 보내준다. pug 템플릿에서 user.videos 를 쓸 수 있다.
    }) 
};



export const home = (req,res)=>{res.render("home" , { video })}