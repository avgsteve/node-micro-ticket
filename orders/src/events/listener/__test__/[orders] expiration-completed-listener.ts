import { Message as NatsMessageClass } from "node-nats-streaming";
import mongoose from "mongoose";
import {
  OrderStatusEnum,
  IExpirationCompleteEvent,
} from "@ticket-microservice2021/common";
import { ExpirationCompletedEventListener } from "../[orders] expiration-completed-listener";
import { natsWrapperInstance } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { Order } from "../../../models/order";

const setup = async () => {
  // https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19565166#questions/10807478
  // 參考 __mocks__ 資料夾的 nats-wrapper.ts

  // 1) create an instance of the expirationListener
  const expirationListener = new ExpirationCompletedEventListener(
    natsWrapperInstance.client
  );

  // 2) Create Data for test

  const ticketDocument = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 222,
  });

  await ticketDocument.save(); // 要記得 await + save

  const orderDocument = Order.build({
    status: OrderStatusEnum.Created,
    userId: "test user id",
    expiresAt: new Date(),
    ticket: ticketDocument,
  });

  await orderDocument.save(); // 要記得 await + save

  // 3) create a fake eventData event
  const fakeEventData: IExpirationCompleteEvent["data"] = {
    orderId: orderDocument.id,
  };

  // 3) create a fake message object
  // @ts-ignore // 關閉 typescript 要求宣告 msg Class 物件裡面的所有 method
  const msg: NatsMessageClass = {
    // 模擬一個假的 ack method 存在 msg Class 物件中
    // 正常情況是使用 msg.ack() 回傳給 Publisher 確認接收到 event
    // 在測試環境中 ack 的值透過 jest.fn() 來模擬
    ack: jest.fn(),
  };

  return { expirationListener, orderDocument, eventData: fakeEventData, msg };
};

it("updates the orderDocument status to cancelled", async () => {
  const { expirationListener, orderDocument, eventData, msg } = await setup();

  // 透過 event listener 的 onMessage method，將 order 的的status 值 改為 order:cancelled
  await expirationListener.onMessage(eventData, msg);

  const updatedOrder = await Order.findById(orderDocument.id);

  expect(updatedOrder!.status).toEqual(
    OrderStatusEnum.Cancelled // OrderStatusEnum.Cancelled 值為: order:cancelled
  );
});

it("emit an OrderCancelled event", async () => {
  const { expirationListener, orderDocument, eventData, msg } = await setup();

  await expirationListener.onMessage(eventData, msg);

  // 檢查 1) ExpirationCompletedEventListener 中的 NATS client 的  有正確執行 .method 方
  // publish method 是 讓publisher發出(emit) cancelled event的function，
  // 才能在 API 收到 delete req之後發布 取消的訊息給NATS service後轉發給其他服務
  expect(natsWrapperInstance.client.publish).toHaveBeenCalled();

  const receivedData = JSON.parse(
    (natsWrapperInstance.client.publish as jest.Mock).mock.calls[0][1]
  );

  // 檢查 2) 接收的資料跟建立的資料的id是相符的
  expect(receivedData.id).toEqual(orderDocument.id);
});

// 收到 event 之後， event listener 是否有正確執行 ack() 來確認接收到 event
it("ack the message", async () => {
  const { expirationListener, eventData, msg } = await setup();

  await expirationListener.onMessage(eventData, msg);

  expect(msg.ack).toHaveBeenCalled();
});
