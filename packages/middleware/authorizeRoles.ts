import { NextFunction, Response } from 'express';
import { AuthError } from '../error-handler';

export const isUser = async (req: any, res: Response, next: NextFunction) => {
  if (req.role !== 'user') {
    throw new AuthError('Unauthorized! Not a User!');
  }
  next();
};

export const isSeller = async (req: any, res: Response, next: NextFunction) => {
  if (req.role !== 'seller') {
    throw new AuthError('Unauthorized! Not a Seller!');
  }
  next();
};

export const isAdmin = async (req: any, res: Response, next: NextFunction) => {
  if (req.role !== 'admin') {
    throw new AuthError('Unauthorized! Not a Admin!');
  }
  next();
};
