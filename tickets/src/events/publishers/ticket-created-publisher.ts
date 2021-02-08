import {
  Publisher,
  EventSubjectsEnum,
  ITicketCreatedEvent,
} from '@ticket-microservice2021/common';

export class TicketCreatedPublisher extends Publisher<ITicketCreatedEvent> {
  subject: EventSubjectsEnum.TicketCreated = EventSubjectsEnum.TicketCreated;
}
