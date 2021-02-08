import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { natsWrapper } from '../nats-wrapper';

/* 
Bull.js
https://github.com/OptimalBits/bull#quick-guide

408. What's Bull All About?
https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19734556#questions/13271462

409. Creating a Queue (流程)
https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19734558#questions/11881622
*/


// DataFormatForNewJob 原本名稱為 Payload
interface DataFormatForNewJob {
  orderId: string; // 限制 listener使用  expirationQueue 的 .add method時， 只能輸入 型別為 string 的 orderId屬性
}


// Enqueue: 產生一個 job 並排入工作隊列
const expirationQueue = new Queue<DataFormatForNewJob>(
  //參數: https://github.com/OptimalBits/bull#basic-usage

  "order:expiration", // arg#1: queue name
  {
    // arg#2: options
    redis: {
      host: process.env.REDIS_HOST,
    },
  }
);

expirationQueue.process(async (job) => {
  console.log("job done!");
  console.log("job id: ", job.id);
  console.log("job state: ", await job.getState());
  console.log("job content: ", job.data);

  new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId,
  });
});

export { expirationQueue };
// 輸出到  [expiration]order-created-listener.ts