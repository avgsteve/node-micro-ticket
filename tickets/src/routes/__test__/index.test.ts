import request from 'supertest';
import { app } from '../../app';

// jest.mock('../../nats-wrapper.ts');

const createTicket = () => {
  // 將產生Promise的 request 作為物件傳出到其他測試function，建立新的ticket到資料庫中
  return request(app).post('/api/tickets').set('Cookie', global.signin()).send({
    title: 'asldkf',
    price: 20,
  });
};

it('can fetch a list of tickets', async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app).get('/api/tickets').send().expect(200);

  expect(response.body.length).toEqual(3);
});
