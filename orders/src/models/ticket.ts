import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Order, OrderStatusEnum } from './order';

interface TicketAttrs {
  id: string; // 強制使用傳進來的 id 作為新文件的 _id
  title: string;
  price: number;
}

// 須要將 ITicketDoc 導入 Order
export interface ITicketDoc extends mongoose.Document {
  title: string;
  price: number;
  // == ↓↓ Static methods ↓↓ ==
  chkIfReserved(): Promise<boolean>;
  // findOneByEventData(): Promise<boolean>;
  version: number;
}

interface ITicketModel extends mongoose.Model<ITicketDoc> {
  build(attrs: TicketAttrs): ITicketDoc;
  findOneByEventData(event: {
    // https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19565158#questions
    id: string;
    version: number;
  }): // 因為使用Promise建立 api call來 傳回資料所以回傳類別是Promise
  Promise<ITicketDoc | null>;
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
      min: 0,
    },
    // userId: {
    //   type: String,
    //   required: true,
    // },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);


ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.findOneByEventData = (eventData: {
  id: string;
  version: number;
}) => {
  return Ticket.findOne({
    _id: eventData.id,
    version: eventData.version - 1,
  });
};


ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};


ticketSchema.methods.chkIfReserved = async function () {
  // this === the ticket document that we just called 'chkIfReserved' on
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      //如果 ticket 已經有 對應的 order 文件產生，且 order.status 為 OrderStatusEnum.Created 的話就當作已經是被預訂
      $in: [
        OrderStatusEnum.Created,
        OrderStatusEnum.AwaitingPayment,
        OrderStatusEnum.Complete,
      ],
    },
  });

  return !!existingOrder;
};


const Ticket = mongoose.model<ITicketDoc, ITicketModel>('Ticket', ticketSchema);

export { Ticket };
