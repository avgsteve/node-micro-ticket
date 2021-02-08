import { Message as StanMessageClass } from 'node-nats-streaming';
import { Listener as BaseListener } from '../base-listener';
import { IOrderCreatedEvent } from './order-created-event';
import { EventSubjectsEnum } from "../event-subjects-status/event-subjects-enumerable";

// 專用於處理接收主題為 ticket:created 的Listener sub Class
export class OrderCreatedListener extends BaseListener<IOrderCreatedEvent> {
  // prop#1:
  // 型別為 EventSubjectsEnum.TicketCreated , 值也是 EventSubjectsEnum.TicketCreated
  // 如此可以避免打錯字的機會
  subject: EventSubjectsEnum.OrderCreated = EventSubjectsEnum.OrderCreated;
  // prop#2:
  queueGroupName = 'payments-service';

  // 處理訊息的 function
  onMessage(
    // arg#1 : 規定讓傳進來的物件遵循 ITicketCreatedEvent 規範
    receivedData: IOrderCreatedEvent['data'],
    // arg#2 :
    msg: StanMessageClass
  ) {
    console.log(`Event data for subject: ${this.subject}`, receivedData);
    console.log('id: ', receivedData.id);
    console.log('status: ', receivedData.status);
    console.log('price: ', receivedData.ticket.price);
    msg.ack();
  }
}
