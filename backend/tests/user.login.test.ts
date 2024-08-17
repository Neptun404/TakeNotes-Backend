import { expect, test } from '@jest/globals';
import 'dotenv/config';
import db from '../src/db';

test('[L001] user login should fail if inputs are empty', async () => {
    const response = await fetch(`http://${process.env.HOST}:${process.env.PORT}/user/login`, {
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

test('[L002] Test user login should fail if inputs are empty spaces', async () => {
    const response = await fetch(`http://${process.env.HOST}:${process.env.PORT}/user/login`, {
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

test('[L003] Test user login should fail if username does not exist', async () => {
    const response = await fetch(`http://${process.env.HOST}:${process.env.PORT}/user/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: 'neptun',
            password: 'neptun123'
        })
    })

    expect(response.status).toBe(401);
})

test('[L004] Test user login should fail if password is incorrect', async () => {
    const response = await fetch(`http://${process.env.HOST}:${process.env.PORT}/user/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: 'neptun',
            password: 'neptun@1234'
        })
    })

    expect(response.status).toBe(401);
})

test('[L005] Test user login should succeed', async () => {
    try {
        await db.user.create({
            data: {
                username: 'neptun',
                password: 'neptun@123'
            }
        })
    } catch (_) { };

    const response = await fetch(`http://${process.env.HOST}:${process.env.PORT}/user/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: 'neptun',
            password: 'neptun@123'
        })
    })

    expect(response.status).toBe(200);
})