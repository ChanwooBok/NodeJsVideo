import User from "../models/User";

export const getJoin = (req,res)=> {res.render("join");}
export const postJoin =  async(req,res) => {
    console.log(req.body);
    const { name , username ,password, email , location } = req.body;
    await User.create({
        name,
        email,
        username,
        location,
        password,
    });
    return res.redirect("/login");
}
export const edit=  (req,res)=> {res.send("edit");}
export const remove = (req,res)=> {res.send("remove");}
export const login = (req,res)=> {res.send("login");}
export const logout = (req,res)=> {res.send("logout");}
export const see = (req,res)=> {res.send("see user");}

export const home = (req,res)=>{res.render("home" , { video })}