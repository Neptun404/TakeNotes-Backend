import { Router } from 'express';
import { login, register } from '../controllers/user.controller'

const router = Router()

export default router
    .post('/login', login)
    .post('/register', register)