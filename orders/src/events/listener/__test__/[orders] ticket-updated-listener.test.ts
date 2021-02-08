import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { ITicketUpdatedEvent } from "@ticket-microservice2021/common";
import { TicketUpdatedListener } from "../[orders] ticket-updated-listener";
import { natsWrapperInstance } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";

// https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19565184#questions/10807478

const setup = async () => {
  // Create a listener
  const listener = new TicketUpdatedListener(natsWrapperInstance.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  // Create a fake eventData object
  const eventData: ITicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1, // 因為前一個 microservice 傳進來之前會先把版本號加一
    title: "new concert",
    price: 999,
    userId: "ablskdjf",
  };

  // Create a fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  // return all of this stuff
  return { msg, eventData, ticket, listener };
};

it("finds, updates, and saves a ticket", async () => {
  const { msg, eventData, ticket, listener } = await setup();

  console.log("finds, updates, and saves a ticket: \n", {
    msg,
    eventData,
    ticket,
    listener,
  });

  await listener.onMessage(eventData, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  // const updatedTicket = await Ticket.findOneByEventData(eventData);

  expect(updatedTicket!.title).toEqual(eventData.title);
  expect(updatedTicket!.price).toEqual(eventData.price);
  expect(updatedTicket!.version).toEqual(eventData.version);
});

it("acks the message", async () => {
  const { msg, eventData, listener } = await setup();
  console.log("acks the message: \n", {
    msg,
    eventData,
    listener,
  });
  await listener.onMessage(eventData, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a skipped version number", async () => {
  // https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19565190#questions/10807478
  // 385. Out-Of-Order Events
  const { msg, eventData, listener, ticket } = await setup();

  eventData.version = 10;

  try {
    await listener.onMessage(eventData, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
