import { EventSubjectsEnum } from "../event-subjects-status/event-subjects-enumerable";
import { OrderStatusEnum } from "../event-subjects-status/order-status-enumerable";

/*
確保listener裡面處理 receivedData 的onMessage method
符合 IOrderCreatedEvent 的格式。
例如 subject property 符合 EventSubjectsEnum 格式
*/

/*
https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19124770#questions
295. Leveraging TypeScript for Listener Validation
"Strong Mapping between subject names and event data"
 */

// 輸出 interface 用於 OrderCreatedEventPublisher 裡面的 base (abtract class) Publisher
export interface IOrderCreatedEvent {
  readonly subject: EventSubjectsEnum.OrderCreated; // readonly 避免 property 被修改, 強制class的subject屬性一定要用EventSubjectsEnum
  data: {
    id: string;
    status: OrderStatusEnum;
    version: number;
    userId: string;
    expiresAt: string; // 用string而不用Date type是為了要轉換資料格式到JSON
    ticket: {
      id: string;
      price: number;
    };
  };
}
