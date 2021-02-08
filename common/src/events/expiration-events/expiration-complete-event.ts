import { EventSubjectsEnum } from "../event-subjects-status/event-subjects-enumerable";

export interface IExpirationCompleteEvent {
  subject: EventSubjectsEnum.ExpirationComplete;
  data: {
    orderId: string;
  };
}
