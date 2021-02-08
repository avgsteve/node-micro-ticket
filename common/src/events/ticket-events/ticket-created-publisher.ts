import { Publisher } from '../base-publisher';
import { ITicketCreatedEvent } from './ticket-created-event';
import { EventSubjectsEnum } from "../event-subjects-status/event-subjects-enumerable";

export class TicketCreatedPublisher extends Publisher<ITicketCreatedEvent> {
  // 因為已經先在 Publisher Class 自行引入  constructor 所需要的變數
  // 所以就不用在 這一個 TicketCreatedPublisher 裡面呼叫 super()
  subject: EventSubjectsEnum.TicketCreated = EventSubjectsEnum.TicketCreated;
}
