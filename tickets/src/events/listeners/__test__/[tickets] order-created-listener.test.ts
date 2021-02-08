import { Message as NatsMessageClass } from "node-nats-streaming";
import mongoose from "mongoose";
import {
  IOrderCreatedEvent,
  OrderStatusEnum,
} from "@ticket-microservice2021/common";
import { OrderCreatedListener } from "../[tickets] order-created-listener";
import { natsWrapperInstance } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19565220#questions/10807478
  // 392. Setup for Testing Reservation

  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapperInstance.client);

  // Create and save a dummyTicketData
  const dummyTicketData = Ticket.build({
    title: "concert",
    price: 99,
    userId: "asdf",
  });
  await dummyTicketData.save();

  // Create the fake event event as order
  const eventDataForOrder: IOrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatusEnum.Created,
    userId: "alskdfj",
    expiresAt: "alskdjf",
    ticket: {
      id: dummyTicketData.id,
      price: dummyTicketData.price,
    },
  };

  // @ts-ignore
  const natsMessageClass: NatsMessageClass = {
    ack: jest.fn(),
  };

  return { listener, dummyTicketData, eventDataForOrder, natsMessageClass };
};

it("sets the orderId of the dummyTicketData", async () => {
  // https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19565226#questions/10807478
  // 393. Test Implementation

  const {
    listener,
    dummyTicketData,
    eventDataForOrder,
    natsMessageClass,
  } = await setup();

  await listener.onMessage(eventDataForOrder, natsMessageClass);

  const updatedTicket = await Ticket.findById(dummyTicketData.id);

  // 確認透過 event bus 傳回來的 order
  expect(updatedTicket!.orderId).toEqual(eventDataForOrder.id);
});

it("acks the message", async () => {
  const {
    listener,
    dummyTicketData,
    eventDataForOrder,
    natsMessageClass,
  } = await setup();

  await listener.onMessage(eventDataForOrder, natsMessageClass);

  expect(natsMessageClass.ack).toHaveBeenCalled();
});

it("publishes event for updating a dummy ticket data", async () => {
  // 397. Mock Function Arguments
  // https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19565248#questions/10693804
  const {
    listener: orderCreatedListener,
    dummyTicketData,
    eventDataForOrder,
    natsMessageClass,
  } = await setup();

  await orderCreatedListener.onMessage(eventDataForOrder, natsMessageClass);

  // 確認 publish 有被成功呼叫
  expect(natsWrapperInstance.client.publish).toHaveBeenCalled();

  /*
  // TS 會針對 mock 報錯
  Property 'mock' does not exist on type '(subject: string, data?: string | Uint8Array | Buffer | undefined, callback?: AckHandlerCallback | undefined) => string'.ts(2339)
  */
  // @ts-ignore
  console.log(natsWrapperInstance.client.publish.mock.calls[0][1]);

  // 所以要改成以下寫法提醒TS, natsWrapperInstance.client.publish
  // 是模擬的 method
  const ticketUpdatedData = JSON.parse(
    (natsWrapperInstance.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(eventDataForOrder.id).toEqual(ticketUpdatedData.orderId);
});
