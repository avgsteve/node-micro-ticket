import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  return ticket;
};

it('fetches orders for an particular user', async () => {
  // Create three tickets
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  const userOneCookie = global.signin();
  const userTwoCookie = global.signin();
  // Create one order as User #1
  await request(app)
    .post('/api/orders')
    .set('Cookie', userOneCookie)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  // Create two orders as User #2 (via Cookie)
  const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwoCookie)
    .send({ ticketId: ticketTwo.id })
    .expect(201);
  const { body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwoCookie)
    .send({ ticketId: ticketThree.id })
    .expect(201);

  // Make request to get orders for User #2
  const {
    body: orders, // destructure response.body.orders
  } = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwoCookie)
      .expect(200);
  
  const result = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwoCookie)
    .expect(200);

  console.log('orders: ', orders);


    // Make sure we only got the orders for User #2
    // expect(response.body.orders.length).toEqual(2);
    // ...
  console.log('result.body: ', result.body);
  
    expect(orders.length).toEqual(2);
    expect(orders[0].id).toEqual(orderOne.id);
    expect(orders[1].id).toEqual(orderTwo.id);
    expect(orders[0].ticket.id).toEqual(ticketTwo.id);
    expect(orders[1].ticket.id).toEqual(ticketThree.id);

});
