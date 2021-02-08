import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import morgan from 'morgan';
import {
  errorHandler,
  NotFoundError,
  currentUser,
} from '@ticket-microservice2021/common';
import { createOrderRouter } from './routes/newOrder';
import { showOrderRouter } from './routes/show';
import { indexOrderRouter } from './routes/index';
import { deleteOrderRouter } from './routes/deleteOrder';

console.log(`current process.env.NODE_ENV: `, process.env.NODE_ENV);

const app = express();
app.set('trust proxy', true);
app.use(
  json(),
  morgan('combined'),
  cookieSession({
    signed: false,
    secure: false,
    // secure: process.env.NODE_ENV !== 'test',
    httpOnly: true,
  })
);
app.use(currentUser); // 在進入任何Route之前要先透過cookie中的 JWT 取得使用者的身分

app.use(createOrderRouter);
app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(deleteOrderRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
