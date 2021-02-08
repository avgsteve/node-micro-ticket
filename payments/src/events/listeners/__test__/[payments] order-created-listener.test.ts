import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import {
  IOrderCreatedEvent,
  OrderStatusEnum,
} from "@ticket-microservice2021/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../[payments] order-created-listener";
import { Order } from "../../../models/[payments] orderModel";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const eventData: IOrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: "alskdjf",
    userId: "alskdjf",
    status: OrderStatusEnum.Created,
    ticket: {
      id: "alskdfj",
      price: 10,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, eventData, msg };
};

//
it("replicates the order info", async () => {
  const { listener, eventData, msg } = await setup();

  await listener.onMessage(eventData, msg);

  const orderFromPaymentDB = await Order.findById(eventData.id);

  expect(orderFromPaymentDB!.price).toEqual(eventData.ticket.price);
});

it("acks the message", async () => {
  const { listener, eventData, msg } = await setup();

  await listener.onMessage(eventData, msg);

  expect(msg.ack).toHaveBeenCalled();
});
