import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import {
  errorHandler,
  NotFoundError,
  currentUser,
} from "@ticket-microservice2021/common";
import { createPaymentRouter } from './routes/createNewPayment';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: false,
    // secure: process.env.NODE_ENV !== 'test',
  })
);
app.use(currentUser);
app.use(createPaymentRouter);
app.use('/', (req, res, next) => {
  console.log('API service entered!');
  return res.send('OK')
  next();
})

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
