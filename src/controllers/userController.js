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
export const edit=  (req,res)=> {res.send("edit");}
export const remove = (req,res)=> {res.send("remove");}
export const getLogin = (req,res)=> {res.render("login" , {pageTitle:"Login"});}

export const postLogin = async(req,res) => {
    const {username , password } = req.body;
    const pageTitle = "login";
    const user = await User.findOne( { username  : username  , socialOnly : false});
    if(!user){
        return res.status(400).render("login" , {
            pageTitle,
            errorMessage : "this username / password is not right ",
        })
    }
    const ok = await bcrypt.compare(password, user.password);
    if(!ok){
        return res.status(400).render("login",{
            pageTitle,
            errorMessage: "Wrong password",
        })
    }

    req.session.loggedIn = true;
    req.session.user = user;
    res.redirect("/");
}

export const startGithubLogin = (req,res) => {

    const baseUrl = "https://github.com/login/oauth/authorize"
    const config = {
        client_id : process.env.GH_CLIENT,
        allow_signup : false,
        scope: "read:user user:email"
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;

    return res.redirect(finalUrl);
}

export const finishGithubLogin = async(req,res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id : process.env.GH_CLIENT,
        client_secret : process.env.GH_SECRET,
        code: req.query.code,
    }

    const params = new URLSearchParams(config).toString(); // 인자들을 합쳐서 하나의 인자로 만듦.
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (
        await fetch(finalUrl, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        })
      ).json();
      if ("access_token" in tokenRequest) {
          //깃허브에서 건네준 access_token이 존재하면 userData,emailData등을 조회 할 수 있다. 
        const { access_token } = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await (
          await fetch(`${apiUrl}/user`, {
            headers: {
              Authorization: `token ${access_token}`,
            },
          })
        ).json();
        console.log(userData);

        const emailData = await( 
            await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json(); // await를 2번 겹쳐써서 then으로 복잡해질 것을 간소화 시켰다. 
        console.log(emailData);
         // emailData를 가져올 수 있는 이유는 startGithubLogin에서 scope를 user:email로 적어주었기 때문이다.
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true 
            ); // emailData는 모든 email을 다불러오므로 조건을 지정해서 만족하는것만 가져온다. 
        if(!emailObj){
            return res.redirect("/login");
        } // 일치하는 이메일이 없으면  로그인 창으로 돌려보낸다. 
        let user = await User.findOne( {emaiL : emailObj.emaiL });
        // 가입된 계정중에서 깃허브 계정이메일과 일치하는 유저가 존재하면 로그인 시켜준다. 
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
            // 깃허브 계정이메일과 일치하는 메일이 없으면 새롭게 계정을 생성해준다. 단, 이때 비밀번호는 없이 게정만으로 로그인 할 수 있다. 
            
        req.session.loggedIn = true;
        req.session.user=  user;
        return res.redirect("/");
      } else {
        return res.redirect("/login");
      }

    };

export const logout = (req,res)=> {
    req.session.destroy();
    return res.redirect("/");
};
export const see = (req,res)=> {res.send("see user");}

export const home = (req,res)=>{res.render("home" , { video })}