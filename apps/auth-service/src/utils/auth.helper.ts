import crypto from 'crypto';
import { ValidationError } from '../../../../packages/error-handler';
import { Request, Response, NextFunction } from 'express';
import redis from '../../../../packages/libs/redis';
import { sendEmail } from './send-mail';
import { UserModel } from '../../../../packages/libs/prisma';
import {
  SellerModel,
  ShopModel,
} from '../../../../packages/libs/db/models/user.model';
import bcrypt from 'bcryptjs';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validationRegisterationData = (
  data: any,
  userType: 'user' | 'seller',
) => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === 'seller' && (!phone_number || !country))
  ) {
    throw new ValidationError(`Missing required Fields!`);
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError(`Invalid Email Address!`);
  }
};

export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction,
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    throw new ValidationError(
      'Acoount Locked due to Multiple Failed Attempts! Try Again After 30 Minutes.',
    );
  }
  if (await redis.get(`otp_spam_lock:${email}`)) {
    throw new ValidationError(
      'Too many OTP requests! Please wait 1 Hour before requesting again.',
    );
  }
  if (await redis.get(`otp_cooldown:${email}`)) {
    throw new ValidationError(
      'Please wait 1 Minute before requesing a new OTP!',
    );
  }
};

export const trackOtpRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;

  let otpRequests = parseInt((await redis.get(otpRequestKey)) || '0');

  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`, 'locked', 'EX', 3600); //Lock for 1 Hour
    throw new ValidationError(
      'Too Many OTP request. Please Wait 1 Hour before Requesting Again',
    );
  }

  await redis.set(otpRequestKey, otpRequests + 1, 'EX', 3600); //Tracks Requests for 1 Hour
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string,
) => {
  const otp = crypto.randomInt(1000, 9999).toString();

  await sendEmail(email, 'Verify Your Email', template, { name, otp });
  await redis.set(`otp:${email}`, otp, 'EX', 300);
  await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60);
};

export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction,
) => {
  const storedOtp = await redis.get(`otp:${email}`);
  if (!storedOtp) {
    throw new ValidationError(`Invalid or Expired OTP!`);
  }

  const failedAttemptsKey = `otp_attemps:${email}`;
  const failedAttemps = parseInt((await redis.get(failedAttemptsKey)) || '0');

  if (storedOtp !== otp) {
    if (failedAttemps >= 2) {
      await redis.set(`otp_lock:${email}`, 'locked', 'EX', 1800);
      await redis.del(`otp:${email}`, failedAttemptsKey);
      throw new ValidationError(
        'Too Many Failed Attempts. Your Account is Locked for 30 minutes!',
      );
    }
    await redis.set(failedAttemptsKey, failedAttemps + 1, 'EX', 300);
    throw new ValidationError(
      `Incorrect OTP. ${2 - failedAttemps} attempts left.`,
    );
  }

  await redis.del(`otp:${email}`, failedAttemptsKey);
};

export const handleForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userType: 'user' | 'seller',
) => {
  try {
    const { email } = req.body;

    if (!email) throw new ValidationError(`Email Required!`);

    // Find User/Seller in DB

    const user =
      userType === 'user'
        ? await UserModel.findOne({ email })
        : await SellerModel.findOne({ email });

    if (!user) throw new ValidationError(`${userType} doesn't Exists!`);

    // Check OTP Restrictions
    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);

    // Generate OTP
    await sendOtp(
      user.name,
      email,
      userType === 'user'
        ? 'forgot-password-user-mail'
        : 'forgot-password-seller-mail',
    );

    res.status(200).json({
      message: `OTP Send to Email. Please verify Your Account.`,
    });
  } catch (err) {
    return next(err);
  }
};

export const verifyUserForgotPasswordOTP = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new ValidationError(`Email and OTP are Required!`);
    }

    await verifyOtp(email, otp, next);

    res.sendStatus(200).json({
      message: 'OTP Verified. You can Reset your password.',
    });
  } catch (err) {
    return next(err);
  }
};

//Verify Seller OTP
export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, password, name, phone_number, country } = req.body;

    if (!email || !otp || !password || !name || !phone_number || !country) {
      throw new ValidationError('All Fields are Required!');
    }

    const existingSeller = await ShopModel.findOne({ email });

    if (existingSeller) {
      throw new ValidationError('Seller Already exists with this email!');
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await SellerModel.create({
      name,
      email,
      password: hashedPassword,
      country,
      phone_number,
    });

    res.status(200).json({ seller });
  } catch (error) {
    next(error);
  }
};

// Create A Shop
export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      name,
      bio,
      address,
      opening_hours,
      website,
      category,
      sellerId,
      social_links,
    } = req.body;

    console.log(req.body);

    if (!name || !bio || !address || !category || !sellerId) {
      throw new ValidationError('All Fields Are Required!');
    }

    const shopData: any = {
      name: name,
      bio: bio,
      address: address,
      opening_hours: opening_hours,
      category: category,
      sellerId: sellerId,
    };

    if (website && website.trim() != '') {
      shopData.website = website;
    }

    const shop = await ShopModel.create(shopData);

    await SellerModel.findByIdAndUpdate(sellerId, {
      $push: { shops: shop._id },
    });

    res.status(200).json({ sucess: true, shop });
  } catch (error) {
    next(error);
  }
};

// Create Stripe Connect Account Link for Seller
export const createStripeConnectAccountLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId, refresh_url, return_url, type } = req.body;
  } catch (error) {
    next(error);
  }
};
