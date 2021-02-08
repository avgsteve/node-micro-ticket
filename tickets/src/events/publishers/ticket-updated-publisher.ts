import {
  Publisher,
  ITicketUpdatedEvent,
  EventSubjectsEnum,
} from '@ticket-microservice2021/common';

export class TicketUpdatedPublisher extends Publisher<ITicketUpdatedEvent> {
  subject: EventSubjectsEnum.TicketUpdated = EventSubjectsEnum.TicketUpdated;
}
