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
  public_id: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema<IProductImage>(
  {
    public_id: { type: String, required: true },
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

// ── Product ────────────────────────────────────────────────────────────────

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPercentage?: number;
  stock: number;
  status: 'active' | 'inactive';
  category: mongoose.Types.ObjectId; // ref: Category
  shop: mongoose.Types.ObjectId; // ref: Shop
  brand: string;
  attributes?: IProductAttribute[];
  images?: IProductImage[];
  reviews?: IReview[];
  ratings: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    brand: { type: String, required: true },
    attributes: {
      type: [ProductAttributeSchema],
      default: [],
    },
    images: {
      type: [ProductImageSchema],
      default: [],
    },
    reviews: {
      type: [ReviewSchema],
      default: [],
    },
    ratings: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const ProductModel =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
