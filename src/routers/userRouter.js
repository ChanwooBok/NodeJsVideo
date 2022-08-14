import express from "express";
import { getChangePassword,postChangePassword, getEdit,postEdit, finishGithubLogin, logout, remove, see, startGithubLogin } from "../controllers/userController";
import {protectorMiddleware , publicOnlyMiddleware , avatarUpload, uploadFiles} from "../middlewares";

const userRouter = express.Router();

userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(uploadFiles.single("avatar"),postEdit);
userRouter.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword);
userRouter.get("/remove", remove);
userRouter.get("/logout",protectorMiddleware, logout);
userRouter.get("/github/start" ,publicOnlyMiddleware,  startGithubLogin);
userRouter.get("/github/finish" ,publicOnlyMiddleware,  finishGithubLogin); // 깃허브 로그인창에서 authorize를 눌렀을때 이동하게 되는 url , finishGithubLogin에서 fetch로 post요청을 보낸다.

userRouter.get("/:id",see);
export default userRouter;