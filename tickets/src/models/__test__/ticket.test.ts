import { Ticket } from '../ticket';
import mongoose from 'mongoose';

it('implements optimistic concurrency control', async (done) => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123',
  });

  // Save the ticket to the database
  await ticket.save();

  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  console.log('firstInstance: ', firstInstance);
  console.log('secondInstance: ', secondInstance);

  // save the first fetched ticket
  await firstInstance!.save();

  // save the second fetched ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    return done();
    // exit test process with done()
  }

  throw new Error('Test process should not reach this point');

  // try {
  //   await secondInstance!.save();
  //   throw new Error('Should not reach this point');
  // } catch (err) {
  //   expect(err).toBeInstanceOf(mongoose.Error.VersionError);
  // }
});

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: '123',
  });

  await ticket.save();
  // console.log('ticker data: \n', ticket);
  expect(ticket.version).toEqual(0);

  await ticket.save();
  //console.log('ticker data: \n', ticket);
  expect(ticket.version).toEqual(1);

  await ticket.save();
  // console.log('ticker data: \n', ticket);
  expect(ticket.version).toEqual(2);
});
