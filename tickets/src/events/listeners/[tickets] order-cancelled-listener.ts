import {
  Listener,
  IOrderCancelledEvent,
  EventSubjectsEnum,
} from '@ticket-microservice2021/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

// 398. Order Cancelled Listener
// https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19565254#notes

export class OrderCancelledListener extends Listener<IOrderCancelledEvent> {
  subject: EventSubjectsEnum.OrderCancelled = EventSubjectsEnum.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(eventData: IOrderCancelledEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(eventData.ticket.id);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.set({ orderId: undefined });
    await ticket.save();
    await new TicketUpdatedPublisher(this.stanClient).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
    });

    msg.ack();
  }
}
