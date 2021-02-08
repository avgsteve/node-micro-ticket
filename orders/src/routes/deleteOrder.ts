import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
} from '@ticket-microservice2021/common';
import { Order, OrderStatusEnum } from '../models/order';
import { natsWrapperInstance } from '../nats-wrapper';

import { OrderCancelledEventPublisher } from '../events/publishers/order-cancelled-publisher';

const router = express.Router();

/*
1) 透過 API 接收、驗證資料
2) 更新已經在MongoDB中建立的 ticket 資料
3) 透過 NATS 發布 Event 將資料傳給其他 microservice
*/

// 1)
router.delete(
  '/api/orders/:orderId',
  requireAuth,

  // 2)
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    // !! make a request to cancel the order (set ticket.status to cancel)
    order.status = OrderStatusEnum.Cancelled;
    await order.save();

    // publishing an event saying this was cancelled!

    new OrderCancelledEventPublisher(natsWrapperInstance.client).publish({
      // id: orderId,
      id: mongoose.Types.ObjectId().toHexString(),
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
