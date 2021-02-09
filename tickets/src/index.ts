import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapperInstance } from './nats-wrapper';
import { OrderCreatedListener } from "./events/listeners/[tickets] order-created-listener";
import { OrderCancelledListener } from "./events/listeners/[tickets] order-cancelled-listener";

/*

1) 檢查環境變數
2) 連接 MongoDB
3) 使用 natsWrapperInstance 建立 sigleton 模式的 nats client 並聯上 nats service
3-1) 使用 nats client 並引入 event listener 並且開始 監聽訊息
4) 執行 ticket 服務 (index.ts) 於 port 3000

 */

const start = async () => {

  console.log('test for tickets service..');

  // 
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }


  try {
    // 透過Class 實例導入 nats 將 nats 與 nats service pod 連線，建立 nats client event listener
    await natsWrapperInstance.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL // k get service ==> nats-srv  ClusterIP   10.36.3.114   4222/TCP,8222/TCP
    );

    // 為 nats client 設定 event listener
    natsWrapperInstance.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });

    // 透過 event listener 結束natsWrapperInstance連線，否則nats publisher會一直送出heartbeat確認連線狀態
    process.on('SIGINT', () => natsWrapperInstance.client.close());
    process.on('SIGTERM', () => natsWrapperInstance.client.close());

    // 3-1) 使用 nats client 並引入 event listener 並且開始 監聽訊息

    // www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19565262#notes
    new OrderCancelledListener(natsWrapperInstance.client).listen();
    new OrderCreatedListener(natsWrapperInstance.client).listen();

    // 4) 執行 ticket 服務 (index.ts) 於 port 3000
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Connected to MongoDb');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000!!!!!!!!');
  });
};

start();
