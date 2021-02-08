// import { series } from 'async';
// const { exec } = require('child_process');
import chalk from 'chalk';
import dayjs from 'dayjs';
import mongoose from 'mongoose';
import { app } from './app';


const startServiceAndDB = async () => {

  console.log('starting ticket service and dabase now..');

  // for JWT token
  if (!process.env.JWT_KEY) {
    throw new Error('No process.env.JWT_KEY is found');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  try {
    const connection = await mongoose.connect(
      // 'mongodb://localhost'
      process.env.MONGO_URI,
      {
        // config for Mongoose
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      }
    );
    console.log(`MongoDB Connected`);
    // console.log( connection );
  } catch (error) {
    console.log(`Error while connecting to DB: \n`, error);
  }

  app.listen(3000, () => {
    console.log(chalk.yellow('\n=== Auth service running on port 3000 ==='));
    console.log(chalk.yellow(`Service started up at: ${dayjs().format()}`));
  });
};

startServiceAndDB();
// series([() => exec('npm update "@ticket-microservice2021/common"')]);
