import {
  Listener,
  IOrderCreatedEvent,
  EventSubjectsEnum,
} from "@ticket-microservice2021/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<IOrderCreatedEvent> {
  /*
  屬性: subject, queueGroupName,  NAST client 建立 subscription 用的參數
  options 是在 base Listen 裡面事先設定好
   */
  subject: EventSubjectsEnum.OrderCreated = EventSubjectsEnum.OrderCreated;

  queueGroupName = queueGroupName;

  // 透過 onMessage 來接收並處理Publisher 發過來的資料
  async onMessage(data: IOrderCreatedEvent["data"], msg: Message) {
    //
    const orderExpirationTime =
      new Date(data.expiresAt).getTime() - new Date().getTime();

    console.log("==> Expiration service has received Event data:\n", data);

    console.log(
      "\n==> Adding data as new job to bull Queue...\n",
      "==> Waiting this many milliseconds to process the job:",
      orderExpirationTime
    );

    // 新增 expiration 相關資料到 REDIS 的 expirationQueue
    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        // delay: 4000,
        delay: orderExpirationTime,
      }
    );

    // 要等到 expirationQueue 的 job 完成後才會執行 ack() 給 Publisher 確認訊息
    msg.ack();
  }
}
