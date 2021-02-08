import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from './events/ticket-created-listener';

console.clear();

// stanClient: 將與cluster建立連線的 NATS 服務的 Stan class 實例
const stanClient = nats.connect(
  'ticketing', // arg#1: Cluster Id
  randomBytes(4).toString('hex'), // arg#2: Client Id (Can be uid or random string as listener id)
  { url: 'http://localhost:4222' } // arg#3: Stan Class options:
);

// Stan 實例 connect 的 event listener
stanClient.on('connect', () => {
  console.log('Listener connected to NATS');

  // 如果收到 NATS 結束連接的訊息，將程式退出運作
  stanClient.on('close', () => {
    console.log('NATS connection closed!');
    process.exit();
  });

  // Listener Class<T extends Event -> TicketCreatedListener -> new TicketCreatedListener
  new TicketCreatedListener(stanClient)

    /*
  .listen() 已經包含 :
    stan.client.subscribe(),     
    subscribe options object,
    stan.client.subscribe.on (監聽事件),
    parseMessage 的功能
*/
    .listen();
});

// 每當收到終止程式的指令或是訊息的時候，先透過 stan client 發出 NATS 結束連接的事件
process.on('SIGINT', () => stanClient.close());
process.on('SIGTERM', () => stanClient.close());

// Per nodejs documentation, 'SIGTERM' is not supported on Windows, it can be listened on. 'SIGINT' works.
// https://nodejs.org/api/process.html#process_signal_events

// Window 可以參考的解決方法
// https://nodejs.org/api/process.html#process_process_kill_pid_signal
