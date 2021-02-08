import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';

import { Password } from '../services/password';
import { UserModel } from '../models/user';
import { validateRequest } from '@ticket-microservice2021/common';
import { BadRequestError } from '@ticket-microservice2021/common';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must supply a password'),
  ],
  // middleware 透過 express-validator檢查是否有產生錯誤
  
  validateRequest,
  // 利用登入資訊尋找使用者
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordsMatch) {
      console.log(
        `${dayjs().format()}: User Login Failed: ${existingUser.email}`
      );
      throw new BadRequestError('Invalid Credentials');
    }

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );

    // Store it on session object
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(existingUser);

    console.log(`
    ${dayjs().format()}) 使用者登入成功:
    user id: ${existingUser._id}
    user: ${existingUser.email}
    `);
  }
);

export { router as signinRouter };
