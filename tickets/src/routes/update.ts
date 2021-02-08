import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
  BadRequestError,
} from '@ticket-microservice2021/common';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from './../events/publishers/ticket-updated-publisher';
import { natsWrapperInstance } from '../nats-wrapper';

const router = express.Router();

/*
1) 透過 API 接收、驗證資料
2) 更新已經在MongoDB中建立的 ticket 資料
3) 透過 NATS 發布 Event 將資料傳給其他 microservice
*/

// 1)
router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be provided and must be greater than 0'),
  ],
  validateRequest,

  // 2)
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      throw new NotFoundError();
    }

    // https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19565264#notes
    // 401. Rejecting Edits of Reserved Tickets
    // 如果已經有 orderId ，表示已經被鎖定(預定)，就不可以開放修改
    if (ticket.orderId) {
      throw new BadRequestError('Ticket is reserved. Not allow to update it.');
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });
    await ticket.save();

    new TicketUpdatedPublisher(natsWrapperInstance.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
