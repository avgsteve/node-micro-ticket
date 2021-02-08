import { Message } from 'node-nats-streaming';
import {
  EventSubjectsEnum,
  Listener,
  ITicketCreatedEvent,
} from '@ticket-microservice2021/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

// 透過 TicketCreatedListener 將 ticket microservice 傳進來的event data
// 轉傳到 order microservice ，存一份同樣內容跟id的 ticket 資料 到  order microservice 的 mongod db
export class TicketCreatedListener extends Listener<ITicketCreatedEvent> {
  subject: EventSubjectsEnum.TicketCreated = EventSubjectsEnum.TicketCreated;
  queueGroupName = queueGroupName;

  // onMessage 可以改成 processIncomingMessage

  // 透過base Listener所使用的 IEvent 的規定，傳入 onMessage method的 data 參數型別為 any
  // 所以也可以使用 ITicketCreatedEvent 作為 data 型別的 interface
  // 藉此產生符合 Ticket.build() 參數格式的物件
  async onMessage(data: ITicketCreatedEvent['data'], msg: Message) {
    const { id, title, price } = data;

    const ticket = Ticket.build({
      id,
      title,
      price,
    });
    await ticket.save();

    msg.ack(); // msg 是 NATS 的 Message Class, 含有 .ack() method
  }
}
