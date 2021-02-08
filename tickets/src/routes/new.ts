import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import nats from 'node-nats-streaming';
import { natsWrapperInstance } from './../nats-wrapper';
import {
  requireAuth,
  TicketCreatedPublisher,
  validateRequest,
} from '@ticket-microservice2021/common';
import { Ticket } from '../models/ticket';

const router = express.Router();

/*
1) 透過 API 接收、驗證資料
2) 建立新的 ticket 資料到 MongoDB
3) 透過 NATS 發布 Event 將資料傳給其他 microservice
*/

// 1)
router.post(
  '/api/tickets',
  requireAuth, // 需要通過驗證才能新增資料
  [
    // ticket title:
    body('title').not().isEmpty().withMessage('Title is required'),
    // ticket price:
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequest,

  // 2)
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    });

    await ticket.save();

    // 3)
    await new TicketCreatedPublisher(natsWrapperInstance.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    // 4)
    console.log('已建立新ticket: \n', ticket);
    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
