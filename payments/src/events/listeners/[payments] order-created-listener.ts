import { Message } from "node-nats-streaming";
import {
  Listener,
  IOrderCreatedEvent,
  EventSubjectsEnum,
} from "@ticket-microservice2021/common";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/[payments] orderModel";

export class OrderCreatedListener extends Listener<IOrderCreatedEvent> {
  subject: EventSubjectsEnum.OrderCreated = EventSubjectsEnum.OrderCreated;
  queueGroupName = queueGroupName;

  // 收到 event 後就 建立新的 order 資料
  async onMessage(data: IOrderCreatedEvent["data"], msg: Message) {
    console.log("payment service 接收到 OrderCreated event: ", data);
    console.log("建立order資料到payments database中");

    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    });
    console.log('新的order資料: \n', order);
    await order.save();

    msg.ack();
  }
}
