import { Router } from "express";
import userRouter from "./user.router";
import noteRouter from "./note.router";
import folderRouter from "./folder.router";
import tagRouter from "./tag.router";

const router = Router()

export default router
    .use('/user/', userRouter)
    .use('/note', noteRouter)
    .use('/folders', folderRouter)
    .use('/tags', tagRouter)