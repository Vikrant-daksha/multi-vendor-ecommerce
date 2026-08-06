import { Request, Response, NextFunction } from 'express';
import {
  checkOtpRestrictions,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validationRegisterationData,
  verifyOtp,
  verifyUserForgotPasswordOTP,
} from '../utils/auth.helper.js';
import {
  SellerModel,
  ShopModel,
  UserModel,
} from '../../../../packages/libs/db/models/user.model.js';
import {
  AuthError,
  ValidationError,
} from '../../../../packages/error-handler/index.js';
import bcrypt from 'bcryptjs';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { setCookie } from '../utils/cookies/setCookies.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-07-29.dahlia',
});

// Register a New User

export const userRegisteration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validationRegisterationData(req.body, 'user');
    const { name, email } = req.body;

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      throw new ValidationError(`User Already Exists With this Email!`);
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, 'user-activation-mail');

    res.status(200).json({
      message: 'OTP sent to Email. Please Verify your Account',
    });
  } catch (err) {
    throw err;
  }
};

// Verify User with OTP

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, password, name } = req.body;
    if (!email || !otp || !password || !name) {
      throw new ValidationError(`All Fields are Required!`);
    }
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      throw new ValidationError(`User Already Exists with this Email!`);
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: `User Registered Successfully!`,
    });
  } catch (err) {
    throw err;
  }
};

// Login User
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError(`Email and Password are Required to Login!`);
    }

    const user = await UserModel.findOne({ email });

    if (!user) throw new ValidationError(`User doesnt Exists`);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AuthError(`Invalid Email or Password!`);

    res.clearCookie('seller_access_token');
    res.clearCookie('seller_refresh_token');

    // Generate Access Token
    const accessToken = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: '15m',
      },
    );

    // Refresh Token
    const refreshToken = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: '7d',
      },
    );

    // Store Token in httpOnly Secure cookie
    setCookie(res, 'refresh_token', refreshToken);
    setCookie(res, 'access_token', accessToken);

    res.status(200).json({
      message: `Login Successful`,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    return next(err);
  }
};

//Refresh Token
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken =
      req.cookies['refresh_token'] ||
      req.cookies['seller_refresh_token'] ||
      req.headers.authorization?.split(' ')[1];

    if (!refreshToken) {
      throw new ValidationError('Unauthorized! No Refresh Token.');
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      throw new JsonWebTokenError('FORBIDDEN! Invalid refresh token.');
    }

    let account;
    if (decoded.role === 'user') {
      account = await UserModel.findById(decoded.id);
    }

    if (decoded.role === 'seller') {
      account = await SellerModel.findById(decoded.id);
    }

    if (!account) {
      throw new AuthError('FORBIDDEN! User/Seller not Found!');
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15m' },
    );

    if (decoded.role === 'user') {
      setCookie(res, 'access_token', newAccessToken);
    } else if (decoded.role === 'seller') {
      setCookie(res, 'seller_access_token', newAccessToken);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

//Get Locked In User
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// User Forgot Password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await handleForgotPassword(req, res, next, 'user');
};

// Verify Forgot Password OTP
export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await verifyUserForgotPasswordOTP(req, res, next);
};

// Reset User Password
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword)
      throw new ValidationError(`Email and New Password are Required!`);

    const user = await UserModel.findOne({ email });
    if (!user) throw new ValidationError(`User Not Found!`);

    // Compare new Password with the Existing One
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      throw new ValidationError(`New Password Cannot be the same as Old One.`);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await UserModel.updateOne(
      { email: email },
      { $set: { password: hashedPassword } },
    );

    res.status(200).json({
      message: 'Password Reset Successfully!',
    });
  } catch (err) {
    return next(err);
  }
};

//Register A New Seller
export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validationRegisterationData(req.body, 'seller');
    const { name, email } = req.body;

    const existingSeller = await SellerModel.findOne({ email });

    if (existingSeller) {
      throw new ValidationError('Seller Already Exists with this email');
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, 'seller-activation');

    res.status(200).json({
      success: true,
      message: 'OTP sent to Your Email. Please Verify Your Account.',
    });
  } catch (error) {
    return next(error);
  }
};

//Seller Strip Link Creation
export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      throw new ValidationError(`Seller Id is Required`);
    }

    const seller = await SellerModel.findById(sellerId);

    if (!seller) {
      throw new ValidationError(`Seller is Not Available with this ID!`);
    }

    const account = await stripe.account.create({
      type: 'express',
      email: seller?.email,
      country: 'GB',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await SellerModel.updateOne(
      { _id: sellerId },
      { $set: { stripeId: account.id } },
    );

    const accountLink = await stripe.accountLinks.create({
      account: account?.id,
      refresh_url: `http://localhost:3000/success`,
      return_url: `http://localhost:3000/success`,
      type: 'account_onboarding',
    });

    res.status(200).json({
      success: true,
      url: accountLink.url,
    });
  } catch (error) {
    next(error);
  }
};

//Login Seller
export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError(`Email and Password are Required to Login!`);
    }

    const seller = await SellerModel.findOne({ email });

    if (!seller) throw new ValidationError(`Seller doesnt Exists`);

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) throw new AuthError(`Invalid Email or Password!`);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    // Generate Access Token
    const accessToken = jwt.sign(
      { id: seller.id, role: 'seller' },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: '15m',
      },
    );

    // Refresh Token
    const refreshToken = jwt.sign(
      { id: seller.id, role: 'seller' },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: '7d',
      },
    );

    // Store Token in httpOnly Secure cookie
    setCookie(res, 'seller_refresh_token', refreshToken);
    setCookie(res, 'seller_access_token', accessToken);

    res.status(200).json({
      message: `Login Successful`,
      user: { id: seller.id, email: seller.email, name: seller.name },
    });
  } catch (err) {
    return next(err);
  }
};

//Get Logged In Seller
export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const seller = req.seller;
    res.status(200).json({ success: true, seller });
  } catch (error) {
    next(error);
  }
};
