import mongoose from 'mongoose';
import { OrderStatusEnum } from '@ticket-microservice2021/common';
import { ITicketDoc } from './ticket';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export { OrderStatusEnum };

interface OrderAttrs {
  userId: string;
  status: OrderStatusEnum;
  expiresAt: Date;
  ticket: ITicketDoc;
}

interface IOrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatusEnum;
  expiresAt: Date;
  ticket: ITicketDoc;
  version: number; // 使用 updateIfCurrentPlugin 自訂的版本屬性
}

interface IOrderModel extends mongoose.Model<IOrderDoc> {
  build(attrs: OrderAttrs): IOrderDoc;
}

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatusEnum), //限定 status 屬性只能依照 OrderStatusEnum 的內容作為值
      default: OrderStatusEnum.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
    },
  },
  // options
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

OrderSchema.set('versionKey', 'version');
OrderSchema.plugin(updateIfCurrentPlugin);

OrderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

// model 是 generic function 所以要傳入  <IOrderDoc, IOrderModel>
const Order = mongoose.model<IOrderDoc, IOrderModel>('Order', OrderSchema);

export { Order };
