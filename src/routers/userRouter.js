import express from "express";
import { getChangePassword,postChangePassword, getEdit,postEdit, finishGithubLogin, logout, remove, see, startGithubLogin } from "../controllers/userController";
import {protectorMiddleware , publicOnlyMiddleware} from "../middlewares";

const userRouter = express.Router();

userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
userRouter.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword);
userRouter.get("/remove", remove);
userRouter.get("/logout",protectorMiddleware, logout);
userRouter.get("/github/start" ,publicOnlyMiddleware,  startGithubLogin);
userRouter.get("/github/finish" ,publicOnlyMiddleware,  finishGithubLogin);

userRouter.get(":id",see);
export default userRouter;