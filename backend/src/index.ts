import 'dotenv/config';
import express from 'express';
import db from './db';

const app = express()

// Test if database connection is working
db.$connect()
    .then(async _ => {
        console.log('Prisma connected')
        await db.$disconnect()
    })
    .catch(async err => {
        console.error(err)
        await db.$disconnect()
        process.exit(1)
    })

/**
 * App configuration here
 */
app.use(express.json());

export default app;