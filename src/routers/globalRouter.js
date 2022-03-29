import express from "express";
import { home, join, login } from "../controllers/userController";
import { search, trending } from "../controllers/videoController";

const globalRouter = express.Router();

globalRouter.get("/", trending);
globalRouter.get("/join", join);
globalRouter.get("/login",login);


export default globalRouter;