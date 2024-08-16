import { NextFunction, Request, Response } from 'express'
import db from '../db';
import bcrypt from 'bcrypt';

export async function login(req: Request, res: Response) {
    res.send('Login user');
}

export async function register(req: Request, res: Response, next: NextFunction) {
    // TODO - Validate user input
    const { username, password } = req.body
    console.log(req.body);

    // Check if username and password are not empty
    if (
        !username ||
        !password ||
        !username.trim() ||
        !password.trim()
    ) {
        return next('Username and password are required')
    }

    // TODO - Check if username already exists
    const user = await db.user.findFirst({
        where: {
            username: username
        }
    })

    // If user exists, return error
    if (user !== null) return next('User already exists');

    // TODO - Hash password
    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // TODO - Create user
    // Create user in database
    await db.user.create({
        data: {
            username,
            password: hashedPassword,
        }
    })

    // Send response with success message and status code
    res.status(201).json({
        message: `User created`,
    })
}

export default {
    login,
    register
}