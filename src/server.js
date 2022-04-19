import "./db";
import "./models/Video";
import express, { response } from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter.js";
import userRouter from "./routers/userRouter.js";
import videoRouter from "./routers/videoRouter.js";
import { localMiddleware } from "./middlewares";
//const express = require("express");    옛날 문법. 바벨을 씀으로써 위와같이 쓸 수 있다.


const PORT = 4000;

const app = express(); // Create Express application
const logger = morgan("dev");


app.set("view engine","pug");
app.set("views",process.cwd()+"/src/views");
app.use(logger);
app.use(express.urlencoded({ extended : true }));



app.use( 
    session( {
        secret: process.env.COOKIE_SECRET,
        resave:false,
        saveUninitialized:false,
        store:MongoStore.create( { mongoUrl : process.env.DB_URL})
    })
);


app.use(localMiddleware);
app.use("/",rootRouter);
app.use("/videos",videoRouter);
app.use("/users",userRouter);

export default app;