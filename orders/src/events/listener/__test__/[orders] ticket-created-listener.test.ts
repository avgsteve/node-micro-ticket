import { Message as NatsMessageClass } from "node-nats-streaming";
import mongoose from "mongoose";
import { ITicketCreatedEvent } from "@ticket-microservice2021/common";
import { TicketCreatedListener } from "../[orders] ticket-created-listener";
import { natsWrapperInstance } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19565166#questions/10807478
  // 參考 __mocks__ 資料夾的 nats-wrapper.ts

  // 1) create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapperInstance.client);

  // 2) create a fake data event
  const fakeEventData: ITicketCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // 3) create a fake message object
  // @ts-ignore // 關閉 typescript 要求宣告 msg Class 物件裡面的所有 method
  const msg: NatsMessageClass = {
    // 模擬一個假的 ack method 存在 msg Class 物件中
    // 正常情況是使用 msg.ack() 回傳給 Publisher 確認接收到 event
    // 在測試環境中 ack 的值透過 jest.fn() 來模擬
    ack: jest.fn(),
  };

  return { listener, eventData: fakeEventData, msg };
};

it("creates and saves a ticket", async () => {
  const { listener, eventData, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(eventData, msg);

  // write assertions to make sure a ticket was created!
  const ticket = await Ticket.findById(eventData.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(eventData.title);
  expect(ticket!.price).toEqual(eventData.price);
});

it("acks the message", async () => {
  const { eventData, listener, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(eventData, msg);

  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});
