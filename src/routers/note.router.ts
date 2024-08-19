import { Router, NextFunction, Request, Response } from "express";
import controllers, { getNote, getNotes } from '../controllers/note.controller';
import jwtAuth from "../middlewares/auth.jwt";
import { HttpError } from 'http-errors'

const router = Router()

export default router
    .use(jwtAuth)
    .get('/:id', getNote)
    .get('/', getNotes)
    .post('/', controllers.createNote)
    .put('/:id', controllers.updateNote)
    .delete('/:id', controllers.deleteNote)
    .use(function (err: HttpError, req: Request, res: Response, next: NextFunction) {
        res.status(err.statusCode).json({
            message: err.message
        })
    });