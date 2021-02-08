import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns a 404 if the ticket is not found', async () => {
  let id = new mongoose.Types.ObjectId().toHexString();
  // id = 'thisIsRandomId'; /* 會傳回錯誤訊息 CastError: Cast to ObjectId failed for value "thisIsRandomId" at path "_id" for model "Ticket" 。  就會傳回 got 400 "Bad Request"*/

  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it('returns the ticket if the ticket is found', async () => {
  const title = 'concert';
  const price = 20;

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price,
    })
    .expect(201);

  // 測試可以成功從資料庫中讀取到剛剛新增的資料
  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});
