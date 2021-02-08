import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';
import { randomBytes } from 'crypto';

// console.clear();

// create NATS server
const stanClient = nats.connect(
  // #1 Cluster Id
  'ticketing',
  // #2 client ID
  randomBytes(6).toString('hex'),
  // #3
  {
    // NATS server 在 GCP kubernetes 內部的位置跟port
    url: 'http://localhost:4222',
  }
);

stanClient.on(
  'connect',
  async () => {
    console.log('Publisher connected to NATS');
    const publisher = new TicketCreatedPublisher(stanClient);
    try {
      /*
      publisher.publish實際為建立 Promise 並在Promise內部藉由 ajax 的特性 
      執行 this.stanClient.publish來發布訊息
      所以 對 .publish  使用 await)
      */
      await publisher.publish(
        // 要送出的資料物件，會在.publish method 裡面被轉為 string 格式
        { id: '123', title: 'concert', price: 20 }
      );
    } catch (err) {
      console.error(err);
    }

    // const data = JSON.stringify({
    //   id: '123',
    //   title: 'concert',
    //   price: '$20',
    // });

    // stanClient.publish('TicketCreated', data, () => {
    //   console.log('Event published');
    // });
  }
);
