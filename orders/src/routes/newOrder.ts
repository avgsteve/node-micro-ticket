import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { body } from 'express-validator';
import nats from 'node-nats-streaming';
import { natsWrapperInstance } from '../nats-wrapper';
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  OrderStatusEnum,
  EventSubjectsEnum,
  BadRequestError,
} from '@ticket-microservice2021/common';
import { Order } from '../models/order';
import { Ticket } from '../models/ticket';
import { OrderCreatedEventPublisher } from '../events/publishers/order-created-publisher';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

/*
1) 透過 API 接收、驗證資料
2) 建立新的 order 資料到 MongoDB
3) 透過 NATS 發布 Event 將資料傳給其他 microservice
*/

// 1)
router.post(
  '/api/orders',
  requireAuth, // 需要通過驗證才能新增資料
  [
    // ticket title:
    body('ticketId')
      .not()
      .isEmpty()
      .custom((
        input: string // 檢查輸入的ticketId須符合 ObjectId 的格式
      ) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('Title is required'),
  ],
  validateRequest,

  /*
    2)
      a) 先在DB中確認 ticket 是否存在
      b) 確認 ticket 還沒被 reserve
      c) 計算訂單過多久沒付款就會到期
      d) 建立訂單到資料庫中
   */
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    // a) Find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // b) Make sure that this ticket is not already reserved
    const ticketIsReserved = await ticket.chkIfReserved();
    if (ticketIsReserved) {
      throw new BadRequestError('Ticket is already reserved');
    }

    // c) Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // d) Build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatusEnum.Created,
      expiresAt: expiration,
      ticket,
    });
    await order.save();

    // Publish an event saying that an order was created

    new OrderCreatedEventPublisher(natsWrapperInstance.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      // expiresAt 是 type: mongoose.Schema.Types.Date,所以可以用 .toISOString()
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    console.log('已經建立新的訂單資料和發出 event data: \n', order);

    res.status(201).send(order);
  }
);

export { router as createOrderRouter };
