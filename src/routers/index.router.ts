import { Router } from "express";
import userRouter from "./user.router";
import noteRouter from "./note.router";
import folderRouter from "./folder.router";

const router = Router()

export default router
    .use('/user/', userRouter)
    .use('/note', noteRouter)
    .use('/folders', folderRouter)