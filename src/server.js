import "./db";
import "./models/Video";
import express from "express";
import flash from 'express-flash';
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter.js";
import userRouter from "./routers/userRouter.js";
import videoRouter from "./routers/videoRouter.js";
import apiRouter from './routers/apiRouter';
import { localsMiddleware } from "./middlewares";
//const express = require("express");    옛날 문법. 바벨을 씀으로써 위와같이 쓸 수 있다.


const PORT = 4000;

const app = express(); // Create Express application
const logger = morgan("dev");

app.use((req, res, next) => {
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    next();
    });
app.set("view engine","pug");
app.set("views",process.cwd()+"/src/views");
app.use(logger);
app.use(express.urlencoded({ extended : true })); // view파일의 form 으로부터 오는 이미지파일,비디오등을 백엔드에서 req.body로 받아 올 수 있게해줌.
// app.use(express.text());
app.use(express.json());  // 프론트엔드에서 string을 받아서 js의 object로 바꾸어준다.

app.use( 
    session( {
        secret: process.env.COOKIE_SECRET,
        resave:false, // 방문하는 모든 유저에게 쿠키를 주지 않음 ( 기억하고 싶은 유저에게만 줄 것)
        saveUninitialized:false, // // true : 로그인하지않고(session값이 unmodified) 방문만하여도 저장함 (즉, 봇들까지도 저장-> db용량초과될것)
        store:MongoStore.create( { mongoUrl : process.env.DB_URL}) // session을 mongodb에 저장해줌으로써 서버가 꺼졌다 켜져도 유저를 기억함.
    })
);
app.use(flash());
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads")); // 브라우저에게 노출시킬 폴더 이름을 적어주면 된다. 안 그러면 폴더를 열어보지 못함.-> 아바타이미지가 안 나옴.
app.use("/static", express.static("assets")); // 서버에게 assets폴더를 열람하게끔 함.
app.use("/",rootRouter);
app.use("/videos",videoRouter);
app.use("/users",userRouter);
app.use("/api",apiRouter);

export default app;