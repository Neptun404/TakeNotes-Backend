import { Router, NextFunction, Request, Response } from "express";
import { createNote, deleteNote, getNote, getNotes, updateNote } from '../controllers/note.controller';
import jwtAuth from "../middlewares/auth.jwt";
import { HttpError } from 'http-errors'

const router = Router()

export default router
    .use(jwtAuth)
    .get('/:id', getNote)
    .get('/', getNotes)
    .post('/', createNote)
    .put('/:id', updateNote)
    .delete('/:id', deleteNote)
    .use(function (err: HttpError, req: Request, res: Response, next: NextFunction) {
        res.status(err.statusCode).json({
            message: err.message
        })
    });