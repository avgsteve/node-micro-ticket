import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatusEnum,
} from "@ticket-microservice2021/common";
import { stripeApiClient } from "../stripeApiClient";
import { Order as OrderModel } from "../models/[payments] orderModel";
import { Payment as PaymentModel } from "../models/[payments] paymentModel";
import { PaymentCreatedPublisher } from "../events/publishers/[payments] payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

// https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/19826458#notes
// 431. Payments Flow with Stripe

// 要先設定  kubectl create secret generic stripeApiClient-secret --from-literal STRIPE_KEY=XXXXXX

// 還有 .yaml的設定

router.post(
  "/api/payments",
  requireAuth,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    // @ts-ignore
    console.log('目前stripe client: \n', stripeApiClient._api);

    console.log(`進行付款 ! orderId: ${orderId}, token: ${token}`);

    const orderFromPaymentDB = await OrderModel.findById(orderId);


    // 如果DB中沒有符合的資料
    if (!orderFromPaymentDB) {
      throw new NotFoundError();
    }

    console.log('已找到訂單資料: ', orderFromPaymentDB);

    // 如果目前使用者的id不符合訂單的使用者id
    if (orderFromPaymentDB.userId !== req.currentUser!.id) {
      console.log('訂單的使用者id和目前使用者的id不符合: ', req.currentUser!.id);
      throw new NotAuthorizedError();
    }

    // 如果訂單資料已經是取消
    if (orderFromPaymentDB.status === OrderStatusEnum.Cancelled) {
      throw new BadRequestError("Cannot pay for an cancelled order");
    }

    // 沒有上列錯誤就進行信用卡付款
    const stripePaymentCharge = await stripeApiClient.charges.create({
      currency: "usd",
      amount: orderFromPaymentDB.price * 100, // unit: cents
      source: token, // 'tok_visa'
    });

    console.log('付款完成 (stripePaymentCharge): ', stripePaymentCharge.outcome);
    //
    const paymentDocumentFromDB = PaymentModel.build({
      orderId,
      stripeId: stripePaymentCharge.id,  // 使用 stripeApiClient 產生的 物件的 id作為
    });

    console.log('已儲存到資料庫中的付款資料: ', paymentDocumentFromDB);

    await paymentDocumentFromDB.save();

    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: paymentDocumentFromDB.id,
      orderId: paymentDocumentFromDB.orderId,
      stripeId: paymentDocumentFromDB.stripeId,
    });

    // 傳出 201 而不是 200
    res.status(201).send({
      id: paymentDocumentFromDB.id,
      payment_detail: paymentDocumentFromDB
    });
  }
);

export { router as createPaymentRouter };
