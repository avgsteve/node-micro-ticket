import { Message as StanMessageClass } from 'node-nats-streaming';
import {
  EventSubjectsEnum,
  Listener,
  ITicketUpdatedEvent,
} from '@ticket-microservice2021/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

// https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19565104#questions
// 透過接收來自 Ticker microservice 的Event訊息，尋找存放在 Order microservice MongoDB 資料庫的 ticket資料

export class TicketUpdatedListener extends Listener<ITicketUpdatedEvent> {
  subject: EventSubjectsEnum.TicketUpdated = EventSubjectsEnum.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(
    eventData: ITicketUpdatedEvent['data'],
    msg: StanMessageClass
  ) {
    // const ticket = await Ticket.findOne({
    //   _id: data.id,
    //   // https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19565152#questions
    //   version: data.version - 1,
    // });

    // https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19565158#questions
    const ticket = await Ticket.findOneByEventData(eventData);

    if (!ticket) {
      throw new Error('Ticket not found (orders/ticket-updated-listener)');
    }

    const { title, price } = eventData;
    // console.log('收到的 title跟price: ', title, price);
    ticket.set({ title, price });
    await ticket.save(); // 儲存修改的資料

    msg.ack();
  }
}
