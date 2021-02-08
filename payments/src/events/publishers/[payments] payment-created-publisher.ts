import {
  EventSubjectsEnum,
  Publisher,
  IPaymentCreatedEvent,
} from "@ticket-microservice2021/common";

export class PaymentCreatedPublisher extends Publisher<IPaymentCreatedEvent> {
  subject: EventSubjectsEnum.PaymentCreated = EventSubjectsEnum.PaymentCreated;
}
