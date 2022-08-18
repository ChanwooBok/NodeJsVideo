import express from "express";
import { watch, getEdit, postEdit, getUpload, postUpload, deleteVideo } from "../controllers/videoController";
import { protectorMiddleware, videoUpload } from "../middlewares";

const videoRouter = express.Router();

//videoRouter.get("/:id(\\d+)",trending);

videoRouter.get("/:id([0-9a-f]{24})", watch);
videoRouter.route("/:id([0-9a-f]{24})/edit").get(getEdit).post(postEdit);
videoRouter.get("/:id(\\d+)/edit", getEdit);
videoRouter.post("/:id(\\d+)/edit", postEdit);
videoRouter.route("/:id([0-9a-f]{24})/delete").get(deleteVideo);
videoRouter.route("/upload").all(protectorMiddleware).get(getUpload).post(videoUpload.fields([{name : "video"} , {name : "thumb"}]),postUpload);
//videoRouter.route("/upload").all(protectorMiddleware).get(getUpload).post(videoUpload.single("video") , postUpload);
//만약,정규식으로 아이디를 정해주지 않으면 upload눌렀을때도 아이딘줄 알고 upload화면이 아니라 watch화면을 보여줘버린다 

export default videoRouter;