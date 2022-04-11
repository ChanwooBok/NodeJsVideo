import User from "../models/User";

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
    console.log(username);
    const exist = await User.exists( { username  : username });
    if(!exist){
        return res.status(400).render("login" , {
            pageTitle : "login",
            errorMessage : "this username / password is not right ",
        })
    }
    res.end();
}

export const logout = (req,res)=> {res.send("logout");}
export const see = (req,res)=> {res.send("see user");}

export const home = (req,res)=>{res.render("home" , { video })}