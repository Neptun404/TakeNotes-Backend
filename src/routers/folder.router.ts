import { Router, Request, Response, NextFunction } from "express";
import { HttpError } from 'http-errors';
import folderController from "../controllers/folder.controller";
import jwtAuth from "../middlewares/auth.jwt";

const router = Router()

export default router
    .use(jwtAuth)
    .get('/', folderController.getFolders)
    .post('/', folderController.createFolder)
    .get('/:id', folderController.getFolder)
    .put('/:id', folderController.updateFolder)
    .delete('/:id', folderController.deleteFolder)
    .use(function (err: HttpError, req: Request, res: Response, next: NextFunction) {
        res.status(err.statusCode).json({
            status: 'failed',
            message: err.message,
            error: err.name
        })
    })