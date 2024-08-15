import { Request, Response } from 'express';
import app from './index';

app.listen(process.env.PORT, () => {
    console.log(`Server started on PORT ${process.env.PORT}`);
});