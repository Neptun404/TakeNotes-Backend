import { NextFunction, Request, Response } from 'express'
import db from '../db';
import bcrypt from 'bcrypt';
import createError from 'http-errors';
import jwt from 'jsonwebtoken';

export async function login(req: Request, res: Response, next: NextFunction) {
    const { username, password } = req.body

    // Check if username and password are not empty
    if (
        !username ||
        !password ||
        !username.trim() ||
        !password.trim()
    ) {
        return next(createError(400, 'Username and password are required'))
    }

    // Fetch user from database
    const user = await db.user.findFirst({
        where: {
            username: username
        }
    })

    // If user does not exist or password is incorrect, return error
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(createError(401, 'Invalid username or password'))
    }

    // Create a JWT token with user id and secret for authentication
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1d' })

    // Send response with success message and status code
    res.json({
        message: 'Login succesful',
        token
    });
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
        return next(createError(400, 'Username and password are required'))
    }

    // TODO - Check if username already exists
    const user = await db.user.findFirst({
        where: {
            username: username
        }
    })

    // If user exists, return error
    if (user !== null) return next(createError(409, 'Username already exists'));

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