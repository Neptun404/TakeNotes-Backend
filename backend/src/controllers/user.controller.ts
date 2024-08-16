import express, { Request, Response } from 'express'

export async function login(req: Request, res: Response) {
    res.send('Login user');
}

export async function register(req: Request, res: Response) {
    res.send('Register user');
}

export default {
    login,
    register
}