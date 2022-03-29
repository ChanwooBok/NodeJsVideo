import express, { response } from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter.js";
import userRouter from "./routers/userRouter.js";
import videoRouter from "./routers/videoRouter.js";
//const express = require("express");    옛날 문법. 바벨을 씀으로써 위와같이 쓸 수 있다.


const PORT = 4000;

const app = express(); // Create Express application
const logger = morgan("dev");


app.set("view engine","pug");
app.set("views",process.cwd()+"/src/views");
app.use(logger);
app.use(express.urlencoded({ extended : true }));
app.use("/",globalRouter);
app.use("/videos",videoRouter);
app.use("/users",userRouter);

const handleListening =  () => 
console.log(`✨Server Listening on port http://localhost:${PORT}`);


app.listen(PORT , handleListening)