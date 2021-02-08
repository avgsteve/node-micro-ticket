import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import {
  OrderStatusEnum,
  IOrderCancelledEvent,
} from "@ticket-microservice2021/common";
import { OrderCancelledListener } from "../[payments] order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from "../../../models/[payments] orderModel";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderFromPaymentDB = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatusEnum.Created,
    price: 10,
    userId: "asldkfj",
    version: 0,
  });
  await orderFromPaymentDB.save();

  const fakeCancelEventData: IOrderCancelledEvent["data"] = {
    id: orderFromPaymentDB.id,
    version: 1,
    ticket: {
      id: "asldkfj",
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, fakeCancelEventData, msg, orderFromPaymentDB };
};

//
it("updates the status of the order", async () => {
  //
  const { listener, fakeCancelEventData, msg, orderFromPaymentDB } = await setup();

  await listener.onMessage(fakeCancelEventData, msg); // this will update order in DB

  // 可以透過 Order.findById 找到正確版本號的 order 資料
  const updatedOrder = await Order.findById(orderFromPaymentDB.id);

  
  expect(updatedOrder!.status).toEqual(OrderStatusEnum.Cancelled); //
} //
);

it("acks the message", async () => {
  const { listener, fakeCancelEventData, msg, orderFromPaymentDB } = await setup();

  await listener.onMessage(fakeCancelEventData, msg);

  expect(msg.ack).toHaveBeenCalled();
});
