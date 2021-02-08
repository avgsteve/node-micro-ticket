import { Message as StanMessageClass } from "node-nats-streaming";
import {
  Listener,
  EventSubjectsEnum,
  IExpirationCompleteEvent,
  OrderStatusEnum,
  IPaymentCreatedEvent,
} from "@ticket-microservice2021/common";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";
import { OrderCancelledEventPublisher } from "../publishers/order-cancelled-publisher";

export class PaymentCreatedEventListener extends Listener<IPaymentCreatedEvent> {
  subject: EventSubjectsEnum.PaymentCreated =
    EventSubjectsEnum.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(
    data: IPaymentCreatedEvent["data"],
    msg: StanMessageClass
  ) {

    console.log("接收到 payment created 訊息 :", data);

    const order = await Order.findById(data.orderId).populate("ticket");

    if (!order) {
      throw new Error("Order not found");
    }

    // 預防取消到已經有payment 的order，不進行下列修改就直接回傳 msg.ack();
    if (order.status === OrderStatusEnum.Complete) return msg.ack();

    order.set({
      status: OrderStatusEnum.Complete,
      // 理想情況: status 為完成之後就不會再修改訂單資料
    });

    await order.save();

    console.log("已將 order status改為 complete");

    msg.ack(); // 確認接收完成
  }
}
