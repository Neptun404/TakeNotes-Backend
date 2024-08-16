import { Errback, NextFunction, Request, Response, Router } from 'express';
import { login, register } from '../controllers/user.controller'

const router = Router()

export default router
    .post('/login', login)
    .post('/register', register)
    .use(function (err: Errback, req: Request, res: Response, next: NextFunction) {
        res.status(400).json({
            err
        })
    })