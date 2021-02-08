import { Message as StanMessageClass } from "node-nats-streaming";
import {
  Listener,
  EventSubjectsEnum,
  IExpirationCompleteEvent,
  OrderStatusEnum,
} from "@ticket-microservice2021/common";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";
import { OrderCancelledEventPublisher } from "../publishers/order-cancelled-publisher";

export class ExpirationCompletedEventListener extends Listener<IExpirationCompleteEvent> {
  subject: EventSubjectsEnum.ExpirationComplete =
    EventSubjectsEnum.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(
    data: IExpirationCompleteEvent["data"],
    msg: StanMessageClass
  ) {
    console.log("接收到 order to expire 訊息 :", data);

    const order = await Order.findById(data.orderId).populate("ticket");

    if (!order) {
      throw new Error("Order not found");
    }

    // 預防取消到已經有payment 的order，不進行下列修改就直接回傳 msg.ack();
    if (order.status === OrderStatusEnum.Complete) {
      console.log("訂單狀態已經完成，不進行訂單修改");
      return msg.ack();
    }

    order.set({
      status: OrderStatusEnum.Cancelled,
      /*
      ticket: 屬性不用改成 null
      因為在 \orders\src\models\ticket.ts  的 ticketSchema.methods.chkIfReserved
      只會檢查只會檢查是否為 
        OrderStatusEnum.Created,
        OrderStatusEnum.AwaitingPayment,
        OrderStatusEnum.Complete,

      而 OrderStatusEnum.Cancelled 不會納入檢查的條件，所以就不會被當作已經預訂
      */
    });

    await order.save();

    console.log(
      "已將訂單狀態改為 cancelled, 發出 OrderCancelledEventPublisher 訊息 "
    );

    new OrderCancelledEventPublisher(this.stanClient).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    msg.ack(); // 確認接收完成
  }
}
