import mongoose, { Document, Schema } from 'mongoose';

// ── Product Attribute ────────────────────────────────────────────────────────

export interface IProductAttribute extends Document {
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductAttributeSchema = new Schema<IProductAttribute>(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { timestamps: true },
);

export const ProductAttributeModel =
  mongoose.models.ProductAttribute ||
  mongoose.model<IProductAttribute>('ProductAttribute', ProductAttributeSchema);

// ── Product Image ──────────────────────────────────────────────────────────

export interface IProductImage extends Document {
  file_id: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema<IProductImage>(
  {
    file_id: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true },
);

export const ProductImageModel =
  mongoose.models.ProductImage ||
  mongoose.model<IProductImage>('ProductImage', ProductImageSchema);

// ── Review ─────────────────────────────────────────────────────────────────

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId; // ref: User
  user: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  productId: mongoose.Types.ObjectId; // ref: Product
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    user: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  { timestamps: true },
);

export const ReviewModel =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export enum productStatus {
  Active = 'Active',
  Pending = 'Pending',
  Draft = 'Draft',
}

// ── Product ────────────────────────────────────────────────────────────────

export interface IProduct extends Document {
  title: string;
  slug: string;
  category: string;
  subCategory: string;
  short_description: string;
  detailed_description: string;
  images: IProductImage[];
  video_url?: string;
  tags?: string[];
  brand?: string;
  colors?: string[];
  sizes?: string[];
  starting_date: Date;
  ending_date: Date;
  stock: number;
  sale_price: number;
  regular_price: number;
  ratings: number;
  warranty: string;
  custom_specifications?: JSON;
  custom_properties?: JSON;
  isDeleted?: boolean;
  cashOnDelivery?: boolean;
  discountPercentage?: number;
  discount_codes: mongoose.Types.ObjectId[];
  status: productStatus;
  deletedAt?: Date;
  // stock: number;
  shop: mongoose.Types.ObjectId; // ref: Shop
  // brand: string;
  // attributes?: IProductAttribute[];
  reviews?: IReview[];
  // ratings: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    short_description: { type: String, required: true },
    detailed_description: { type: String, required: true },
    images: {
      type: [ProductImageSchema],
      default: [],
    },
    video_url: { type: String },
    tags: { type: [String], default: [] },
    brand: { type: String },
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    starting_date: { type: Date },
    ending_date: { type: Date },
    stock: { type: Number, required: true, default: 0 },
    sale_price: { type: Number, required: true },
    regular_price: { type: Number, required: true },
    ratings: { type: Number, default: 0 },
    warranty: { type: String, required: true },
    custom_specifications: { type: Schema.Types.Mixed },
    custom_properties: { type: Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false },
    cashOnDelivery: { type: Boolean, default: false },
    discountPercentage: { type: Number, default: 0 },
    discount_codes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'DiscountCode',
      },
    ],
    status: {
      type: String,
      enum: Object.values(productStatus),
      default: productStatus.Draft,
    },
    deletedAt: { type: Date },
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    reviews: {
      type: [ReviewSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export const ProductModel =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export interface ISiteConfig extends Document {
  categories: string[];
  subCategories: JSON;
}

const SiteConfigSchema = new Schema<ISiteConfig>(
  {
    categories: {
      type: [String],
      default: [],
    },
    subCategories: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

export const SiteConfigModel =
  mongoose.models.SiteConfig ||
  mongoose.model<ISiteConfig>('SiteConfig', SiteConfigSchema);

export interface IDiscountCode extends Document {
  public_name: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  discountCode: string;
  sellerId: mongoose.Types.ObjectId;
  minimumOrderAmount?: number;
  usageLimit?: number;
  usageCount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  products: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const DiscountCodeSchema = new Schema<IDiscountCode>(
  {
    public_name: { type: String, required: true },
    discountType: {
      type: String,
      enum: ['fixed', 'percentage'],
      required: true,
    },
    discountValue: { type: Number, required: true },
    discountCode: {
      type: String,
      required: true,
      uppercase: true,
      unique: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    minimumOrderAmount: { type: Number },
    usageLimit: { type: Number },
    usageCount: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean },
    products: {
      type: [Schema.Types.ObjectId],
      ref: 'Product',
      default: [],
    },
  },
  { timestamps: true },
);

export const DiscountCodeModel =
  mongoose.models.DiscountCode ||
  mongoose.model<IDiscountCode>('DiscountCode', DiscountCodeSchema);
