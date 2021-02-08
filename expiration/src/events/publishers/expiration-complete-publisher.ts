import {
  EventSubjectsEnum,
  Publisher,
  IExpirationCompleteEvent,
} from "@ticket-microservice2021/common";

export class ExpirationCompletePublisher extends Publisher<IExpirationCompleteEvent> {
  subject: EventSubjectsEnum.ExpirationComplete =
    EventSubjectsEnum.ExpirationComplete;
}
