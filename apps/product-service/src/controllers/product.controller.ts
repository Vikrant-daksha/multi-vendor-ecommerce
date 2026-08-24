import { Request, Response, NextFunction } from 'express';
import {
  DiscountCodeModel,
  ProductModel,
  SiteConfigModel,
} from '../../../../packages/libs/db/models/products.model';
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from '../../../../packages/error-handler';
import imagekit from '../../../../packages/libs/imagekit';

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

//Create Discount Codes
export const createDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      public_name,
      discountType,
      discountValue,
      discountCode,
      minimumOrderAmount,
      usageLimit,
      usageCount,
      startDate,
      endDate,
      isActive,
      products,
    } = req.body;

    const isDiscountCodeExists = await DiscountCodeModel.findOne({
      where: discountCode,
    });

    if (isDiscountCodeExists) {
      throw new ValidationError(
        'Discount Code Already Available Please use a different Code!',
      );
    }

    const discount_code = await DiscountCodeModel.create({
      public_name,
      discountType,
      discountValue: parseFloat(discountValue),
      discountCode,
      minimumOrderAmount,
      usageLimit,
      usageCount,
      startDate,
      endDate,
      isActive,
      products,
      sellerId: req.seller.id,
    });

    return res.status(201).json({ success: true, discount_code });
  } catch (error) {
    return next(error);
  }
};

//Get Discount Codes
export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const discount_codes = await DiscountCodeModel.find({
      sellerId: req.seller.id,
    });
    return res.status(200).json({ success: true, discount_codes });
  } catch (error) {
    return next(error);
  }
};

//Delete Discount Code
export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller?.id;

    const discount_code = await DiscountCodeModel.findOne({
      _id: id,
      sellerId,
    });

    if (!discount_code) {
      throw new NotFoundError('Discount Code Not Found');
    }

    if (discount_code.sellerId.toString() !== sellerId.toString()) {
      throw new ValidationError('Unauthorized Access!');
    }

    await DiscountCodeModel.findByIdAndDelete({ _id: id });

    return res
      .status(200)
      .json({ success: true, message: 'Discount Code Deleted Successfully!' });
  } catch (error) {
    return next(error);
  }
};

//Upload Product Image
export const uploadProductImage = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileName } = req.body;

    const response = await imagekit.upload({
      file: fileName,
      fileName: `product-${Date.now()}.jpg`,
      folder: '/products',
    });

    res.status(201).json({ file_url: response.url, fileName: response.fileId });
  } catch (error) {
    return next(error);
  }
};

//Delete Product Image
export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileId } = req.body;

    const response = await imagekit.deleteFile(fileId);

    return res.status(201).json({ success: true, response });
  } catch (error) {
    return next(error);
  }
};

//Create Product
export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      title,
      short_description,
      detailed_description,
      warranty,
      custom_specifications,
      slug,
      tags,
      cash_on_delivery,
      brand,
      video_url,
      category,
      colors = [],
      sizes = [],
      discountCodes,
      stock,
      sale_price,
      regular_price,
      sub_category,
      customProperties = {},
      images = [],
    } = req.body;

    if (
      !title ||
      !short_description ||
      !detailed_description ||
      !warranty ||
      !slug ||
      !cash_on_delivery ||
      !category ||
      !sale_price ||
      !regular_price ||
      !sub_category ||
      !images
    ) {
      throw new ValidationError('All Fields are Required!');
    }

    if (!req.seller?.id) {
      throw new AuthError('Unauthorized Access');
    }

    const slugChecking = await ProductModel.findOne({
      slug,
    });

    if (slugChecking) {
      throw new ValidationError(
        'Slug Already Exist! Please use different Slug!',
      );
    }

    const shopId = req.seller?.shops?.[0]?._id || req.seller?.shops?.[0]?.id;
    if (!shopId) {
      throw new ValidationError('Seller does not have an active shop!');
    }

    const newProduct = await ProductModel.create({
      title,
      short_description,
      detailed_description,
      warranty,
      slug,
      tags: Array.isArray(tags) ? tags : tags.split(','),
      cashOnDelivery: cash_on_delivery,
      brand,
      video_url,
      category,
      colors: colors || [],
      sizes: sizes || [],
      discountCodes: discountCodes.map((id: string) => id),
      stock: parseInt(stock),
      sale_price: parseFloat(sale_price),
      regular_price: parseFloat(regular_price),
      subCategory: sub_category,
      customProperties: customProperties || [],
      custom_specifications: custom_specifications || {},
      images: images
        .filter((image: any) => image && image.fileId && image.file_url)
        .map((image: any) => ({
          file_id: image.fileId,
          url: image.file_url,
        })),
      shop: shopId,
    });

    res.status(201).json({ success: true, newProduct });
  } catch (error) {
    return next(error);
  }
};

//Get Logged in Seller Products
export const getShopProducts = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const shopId = req.seller?.shops?.[0]?._id || req.seller?.shops?.[0]?.id;
    if (!shopId) {
      throw new ValidationError('Seller does not have an active shop!');
    }
    const products = await ProductModel.find({ shop: shopId }).populate('shop');

    return res.status(200).json({ success: true, products });
  } catch (error) {
    return next(error);
  }
};

//Delete Product
export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.shops?.[0]?._id;

    const product = await ProductModel.findOne({
      _id: productId,
      shop: sellerId,
    });

    if (!product) {
      throw new NotFoundError('Product Not Found');
    }

    if (product.shopId.toString() !== sellerId.toString()) {
      throw new ValidationError('Unauthorized Access!');
    }

    const deletedProduct = await ProductModel.findByIdAndUpdate(
      { _id: productId },
      {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    );

    return res.status(200).json({
      message:
        'Product is scheduled for deletion in 24 hours. You can restore it within this time frame Deleted Successfully!',
      deletedAt: deletedProduct.deletedAt,
    });
  } catch (error) {
    return next(error);
  }
};

//Restore Product
export const restoreProduct = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.shops?.[0]?._id;

    const product = await ProductModel.findOne({
      _id: productId,
      shop: sellerId,
    });

    if (!product) {
      throw new NotFoundError('Product Not Found');
    }

    if (product.shopId.toString() !== sellerId.toString()) {
      throw new ValidationError('Unauthorized Access!');
    }

    if (!product.isDeleted) {
      return res
        .status(400)
        .json({ message: 'Product is not in deleted state!' });
    }

    const restoredProduct = await ProductModel.findByIdAndUpdate(
      { _id: productId },
      {
        isDeleted: false,
        deletedAt: null,
      },
    );

    return res.status(200).json({ message: 'Product Restored Successfully!' });
  } catch (error) {
    return next(error);
  }
};
