import Stripe from 'stripe';
require('dotenv').config();

// let KEY = "";
// if (process.env.STRIPE_KEY_LOCAL) KEY = process.env.STRIPE_KEY_LOCAL;
// if (process.env.STRIPE_KEY) KEY = process.env.STRIPE_KEY!;

let KEY = process.env.STRIPE_KEY_LOCAL || process.env.STRIPE_KEY;

console.log(`current Stripe API key: ${KEY!.slice(0, 8)}_**encrypted**_${KEY!.slice(KEY!.length - 3)}`);

export const stripeApiClient = new Stripe(
  KEY!,
  {
    // @ts-ignore
    apiVersion: '2020-03-02',
  });

// ref: https://stripe.com/docs/api/charges/create   ==> Create A Charge