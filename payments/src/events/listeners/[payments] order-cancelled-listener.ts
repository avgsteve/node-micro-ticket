import {
  IOrderCancelledEvent,
  EventSubjectsEnum,
  Listener,
  OrderStatusEnum,
} from "@ticket-microservice2021/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/[payments] orderModel";

export class OrderCancelledListener extends Listener<IOrderCancelledEvent> {

  subject: EventSubjectsEnum.OrderCancelled = EventSubjectsEnum.OrderCancelled;

  queueGroupName = queueGroupName;

  // 
  async onMessage(data: IOrderCancelledEvent["data"], msg: Message) {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1, // 因為cancel之前一定會接收到一個create的 event，所以要找出的是create 的版本的資料
    });

    if (!order) {
      throw new Error("Order not found");
    }

    order.set({ status: OrderStatusEnum.Cancelled });
    await order.save();

    msg.ack();
  }
}
