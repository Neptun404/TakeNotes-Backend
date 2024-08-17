import { expect, test } from '@jest/globals';
import 'dotenv/config';
import db from '../src/db';

test('[R001] user registration should fail if inputs are empty', async () => {
    const response = await fetch(`http://${process.env.HOST}:${process.env.PORT}/user/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: '',
            password: ''
        })
    })

    expect(response.status).toBe(400);
})

test('[R002] Test user registration should fail if inputs are empty spaces', async () => {
    const response = await fetch(`http://${process.env.HOST}:${process.env.PORT}/user/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: ' ',
            password: ' '
        })
    })

    expect(response.status).toBe(400); // Assuming 400 is the status for a bad request
})

test('[R003] Test user registration should fail if username already exists', async () => {
    const response = await fetch(`http://${process.env.HOST}:${process.env.PORT}/user/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: 'neptun',
            password: 'neptun@123'
        })
    })

    expect(response.status).toBe(409);
})

test('[R004] Test user registration should succeed', async () => {
    // Delete user if it already exists
    await db.user.delete({
        where: {
            username: 'neptun'
        }
    })
    
    const response = await fetch(`http://${process.env.HOST}:${process.env.PORT}/user/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: 'neptun',
            password: 'neptun@123'
        })
    })

    expect(response.status).toBe(201);
})