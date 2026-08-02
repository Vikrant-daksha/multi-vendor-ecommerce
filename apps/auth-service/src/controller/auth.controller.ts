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
import { UserModel } from '../../../../packages/libs/db/models/user.model.js';
import {
  AuthError,
  ValidationError,
} from '../../../../packages/error-handler/index.js';
import bcrypt from 'bcryptjs';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { setCookie } from '../utils/cookies/setCookies.js';

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

    // Generate Access Token
    const accessToken = jwt.sign(
      { id: user.id, role: 'User' },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: '15m',
      },
    );

    // Refresh Token
    const refreshToken = jwt.sign(
      { id: user.id, role: 'User' },
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

//Refresh Token User
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies.refresh_token;

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

    // let account;
    // if (decoded.role === "User") {
    // }

    const user = await UserModel.findById(decoded.id);

    if (!user) {
      throw new AuthError('FORBIDDEN! User/Seller not Found!');
    }

    const newAccessToken = await jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15m' },
    );

    setCookie(res, 'access_token', newAccessToken);
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
  await handleForgotPassword(req, res, next, 'User');
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
  } catch (error) {
    return next(error);
  }
};
