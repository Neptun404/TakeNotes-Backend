import { NextFunction, Request, Response, Router } from 'express';
import { login, register } from '../controllers/user.controller'
import { HttpError } from 'http-errors'

const router = Router()

export default router
    .post('/login', login)
    .post('/register', register)
    .use(function (err: HttpError, req: Request, res: Response, next: NextFunction) {
        res.status(err.statusCode).json({
            message: err.message
        })
    })