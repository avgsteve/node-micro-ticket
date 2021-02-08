import { Message } from 'node-nats-streaming';
import {
  Listener,
  IOrderCreatedEvent,
  EventSubjectsEnum,
} from '@ticket-microservice2021/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

// https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19565210#questions/10807478

export class OrderCreatedListener extends Listener<IOrderCreatedEvent> {
  subject: EventSubjectsEnum.OrderCreated = EventSubjectsEnum.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: IOrderCreatedEvent['data'], msg: Message) {
    // Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // If no ticket, throw error
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Mark the ticket as being reserved by setting its orderId property
    // 只要一個 ticket 有了 orderId 就代表已經被order (被預訂)
    ticket.set({ orderId: data.id });

    // Save the ticket
    await ticket.save();

    //
    await new TicketUpdatedPublisher(
      // 395. Private vs Protected Properties
      // https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19565230#questions/11924508
      this.stanClient
    ).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId, // 只要一個 ticket 有了 orderId 就代表已經被order (被預訂)
      version: ticket.version,
    });

    // ack the message
    msg.ack();
  }
}
