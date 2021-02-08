import { EventSubjectsEnum } from "../event-subjects-status/event-subjects-enumerable";

/*
確保listener裡面處理 receivedData 的onMessage method
符合 ITicketCreatedEvent 的格式。
例如 subject property 符合 EventSubjectsEnum 格式
*/

/*
https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19124770#questions
295. Leveraging TypeScript for Listener Validation
"Strong Mapping between subject names and event data"
 */

export interface ITicketCreatedEvent {
  readonly subject: EventSubjectsEnum.TicketCreated; // readonly 避免 property 被修改
  data: {
    id: string;
    version: number;
    title: string;
    price: number;
    userId: string;
    // orderId?: string; 不一定要使用因為一開始的時候完全用不到 orderId, 直到 有預定的時候才會需要用到
  };
}
