import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import morgan from 'morgan';
import cors from 'cors'
// import chalk from 'chalk';
// import dayjs from 'dayjs';
// import mongoose from 'mongoose';
import cookieSession from 'cookie-session';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler } from '@ticket-microservice2021/common';
import { NotFoundError } from '@ticket-microservice2021/common';

console.log(`current process.env.NODE_ENV: `, process.env.NODE_ENV);
const app = express();
app.set('trust proxy', true); // 允許來自 nginx proxy 的 req
app.use(
  json(), // parse req.body
  cors(),
  morgan('combined'),
  cookieSession({
    signed: false,
    secure: false,
    // secure: process.env.NODE_ENV !== 'test', // 使用 jest 進行測試的時候會設為 'test
    httpOnly: true,
  })
);

// app.get('/api/users/currentuser', (req, res) => {
//   res.send('Hi there!!');
// });

app.use(currentUserRouter);

app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all(
  '*',
  async (
    req,
    res
    // next
  ) => {
    // next(new NotFoundError());  // 改成以下就可以不用 next
    throw new NotFoundError();
    // https://expressjs.com/en/guide/error-handling.html

    // https://www.npmjs.com/package/express-async-errors
  }
);

app.use(errorHandler);

export { app };
