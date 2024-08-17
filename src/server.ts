import { Request, Response } from 'express';
import app from './index';

import router from './routers/index.router';
app.use(router)

app.listen(process.env.PORT, () => {
    console.log(`Server started on PORT ${process.env.PORT}`);
});