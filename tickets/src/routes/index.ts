import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
  const tickets = await Ticket.find({
    // 只會顯示還沒有被預訂 (還沒建立訂單) 的 ticket 資料
    orderId: undefined
  });

  res.send(tickets);
});

export { router as indexTicketRouter };
