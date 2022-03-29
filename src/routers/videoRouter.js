import express from "express";
import { watch, getEdit, postEdit, test } from "../controllers/videoController";

const videoRouter = express.Router();

//videoRouter.get("/:id(\\d+)",trending);
videoRouter.get("/:id(\\d+)", watch);
videoRouter.route("/:id(\\d+)/edit").get(getEdit).post(postEdit);
// videoRouter.get("/:id(\\d+)/edit", getEdit);
// videoRouter.post("/:id(\\d+)/edit", postEdit);
videoRouter.get("/test", test);
export default videoRouter;