import {
  Publisher,
  EventSubjectsEnum,
  IOrderCancelledEvent,
} from '@ticket-microservice2021/common';

export class OrderCancelledEventPublisher extends Publisher<IOrderCancelledEvent> {
  subject: EventSubjectsEnum.OrderCancelled = EventSubjectsEnum.OrderCancelled;
}
