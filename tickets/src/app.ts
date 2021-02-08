import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import morgan from 'morgan';
import cors from "cors";

import {
  errorHandler,
  NotFoundError,
  currentUser,
} from '@ticket-microservice2021/common';
import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { indexTicketRouter } from './routes/index';
import { updateTicketRouter } from './routes/update';

console.log(`current process.env.NODE_ENV: `, process.env.NODE_ENV);

const app = express();
app.set('trust proxy', true);
app.use(
  cors(),
  json(),
  morgan('combined'),
  cookieSession({
    signed: false,
    secure: false,
    // secure: process.env.NODE_ENV !== 'test',
    // httpOnly: true,
  })
);
app.use(currentUser); // 在進入任何Route之前要先透過cookie中的 JWT 取得使用者的身分

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
