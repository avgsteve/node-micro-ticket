import express, { Request, Response } from 'express';
import { Order } from '../models/order';
import { requireAuth } from '@ticket-microservice2021/common';

const router = express.Router();

router.get(
  '/api/orders', // 讀取當前使用者的所有訂單資料
  requireAuth,
  async (req: Request, res: Response) =>
  {
    const orders = await Order.find({
      userId: req.currentUser!.id,
    }).populate('ticket'); // 展開 ticket 屬性的資料

    res.send(orders); //
  }

);

export { router as indexOrderRouter };
