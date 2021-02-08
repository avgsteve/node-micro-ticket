import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';

console.clear();

// create NATS server
const stan = nats.connect(
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

stan.on('connect', () => {
  console.log('Publisher connected to NATS');

  const data = JSON.stringify({
    id: '123',
    title: 'concert',
    price: 20,
  });

  // 要廣播出去給 listener 的資料
  // 透過 Asynchronous Publishing
  // https://www.npmjs.com/package/node-nats-streaming#asynchronous-publishing
  stan.publish(
    'ticket:created',
    // subject name of publish
    // 同時也是 channel name
    data, // data to publish
    (err, aGuid) => {
      console.log('Event published');
      if (err) {
        console.log('Error publishing: ' + aGuid + ' - ' + err);
      }
    } // callback function
  );
});
