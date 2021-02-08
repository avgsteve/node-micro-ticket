import nats, { Message as MessageClass, Stan } from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from './events/ticket-created-listener';

console.clear();

// stan: 將與cluster建立連線的 NATS 服務的 Stan class 實例
const stan = nats.connect(
  // Cluster Id
  'ticketing',
  // Client Id (Can be uid or random string as listener id)
  randomBytes(4).toString('hex'),
  // Stan Class options:
  {
    url: 'http://localhost:4222',
  }
);

// Stan 實例 的 connect event listener
stan.on('connect', () => {
  console.log('Listener connected to NATS');

  // 如果收到 NATS 結束連接的訊息，將程式退出運作
  stan.on('close', () => {
    console.log('NATS connection closed!');
    process.exit();
  });

  const subscriptOptions = stan
    .subscriptionOptions()

    /* 使用 setManualAckMode 之後就要在 subscription.on
    使用 setDeliverAllAvailable 之後就要在 subscription.on
    裡面使用 .ack() 發送給 publisher 確認接收訊息成功
    */
    .setManualAckMode(true)

    /* 
    說明: Configures the subscription to replay from first available message.
    在listen中，從第一筆開始把所有的訊息都列出來，目的是為了在listener服務出問題的時候，可以從頭接收所有訊息
    */
    .setDeliverAllAvailable()

    /* 
    .setDurableName 說明: Sets a durable subscription name that the client can specify for the subscription. This enables the subscriber to close the connection without canceling the subscription and resume the subscription with same durable name. Note the server will resume the subscription with messages that have not been acknowledged.
    使用 setDurableName 作為將 publisher 的訊息作為群組的群組名稱，如此當服務重新啟動的時候，只會透過 setDeliverAllAvailable
    接收已經處理完的訊息，不用從頭全部重新接收一次
    https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19124592#questions
    */
    .setDurableName('accounting-service');

  const subscription = stan.subscribe(
    // message subject
    'ticket:created',
    // Queue group name to subscribe to
    'queue-group-name',
    subscriptOptions
  );

  subscription.on('message', (msg: MessageClass) => {
    const data = msg.getData();
    if (typeof data === 'string') {
      console.log(
        `[${msg.getTimestamp()}] Received event #${msg.getSequence()},
      ${msg.getSubject()} 
        with data:\n ${data}`
      );
    }
    msg.ack();
  });

  new TicketCreatedListener(stan)
    /*
  .listen() 已經包含 :
    1) stan.client.subscribe, subscribe options
      stan.client.subscribe.on (監聽事件) 和
      parseMessage 的功能
*/
    .listen();
});

// 每當收到終止程式的指令或是訊息的時候，先透過 stan client 發出 NATS 結束連接的訊息
process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());

// Per nodejs documentation, 'SIGTERM' is not supported on Windows, it can be listened on. 'SIGINT' works.
// https://nodejs.org/api/process.html#process_signal_events

// Window 可以參考的解決方法
// https://nodejs.org/api/process.html#process_process_kill_pid_signal
