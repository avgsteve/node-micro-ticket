import {
  Publisher,
  EventSubjectsEnum,
  IOrderCreatedEvent,
} from '@ticket-microservice2021/common';

export class OrderCreatedEventPublisher extends Publisher<IOrderCreatedEvent> {
  subject: EventSubjectsEnum.OrderCreated = EventSubjectsEnum.OrderCreated;
  // 由於 interface IOrderCreatedEvent 強制要求 subject 是 readonly 且subject的值 必須為 EventSubjectsEnum.OrderCreated
}
