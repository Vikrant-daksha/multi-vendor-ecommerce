import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../libs/prisma';
import { SellerModel } from '../libs/db/models/user.model';

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies['access_token'] ||
      req.cookies['seller_access_token'] ||
      req.headers.authorization?.split(' ')[1];

    if (!token)
      return res.status(401).json({ message: 'Unauthorized! Token Missing!' });

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      id: string;
      role: 'user' | 'seller';
    };

    if (!decoded)
      return res.status(401).json({ message: 'Unauthorized! Invalid Token!' });

    let account;

    if (decoded.role === 'user') {
      account = await UserModel.findById(decoded.id);
      req.user = account;
    }

    if (decoded.role === 'seller') {
      account = await SellerModel.findById(decoded.id).populate('shops');
      req.seller = account;
    }

    if (!account)
      return res.status(401).json({ message: 'Account not Found!' });

    req.role = decoded.role;

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid Token!' });
  }
};

export default isAuthenticated;
