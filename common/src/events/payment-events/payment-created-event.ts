import { EventSubjectsEnum } from "../event-subjects-status/event-subjects-enumerable";

export interface IPaymentCreatedEvent {
  subject: EventSubjectsEnum.PaymentCreated;
  data: {
    id: string;
    orderId: string;
    stripeId: string;
  };
}
