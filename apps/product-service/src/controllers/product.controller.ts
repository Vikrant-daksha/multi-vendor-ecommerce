import { Request, Response, NextFunction } from 'express';
import { SiteConfigModel } from '../../../../packages/libs/db/models/products.model';

// Get Product Categories
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const config = await SiteConfigModel.findOne({});

    if (!config) {
      return res.status(404).json({ message: 'Categories Not Found' });
    }

    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};
