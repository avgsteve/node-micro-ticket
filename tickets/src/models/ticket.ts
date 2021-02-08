import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

interface ITicketDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
  version: number; // 使用 updateIfCurrentPlugin 自訂的版本屬性
  orderId?: string; // optional property
}

interface ITicketModel extends mongoose.Model<ITicketDoc> {
  build(attrs: TicketAttrs): ITicketDoc;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    // https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19565216#questions/10807478
    // 391. Reserving a Ticket
    orderId: {
      // 只要一個 ticket 有了 orderId 就代表已經被order (被預訂)
      type: String,
      required: false,
    }
    
  },
  {
    // optimisticConcurrency: true, // https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19565130#questions/12557760
    // versionKey: 'version',
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

//www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19565128#questions/12654030
ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<ITicketDoc, ITicketModel>('Ticket', ticketSchema);

export { Ticket };
