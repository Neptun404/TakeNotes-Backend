import 'dotenv/config';
import express from 'express';

const app = express()
/**
 * App configuration here
 */
app.use(express.json());

export default app;