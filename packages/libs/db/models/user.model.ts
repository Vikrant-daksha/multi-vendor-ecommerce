import mongoose, { Document, Schema } from 'mongoose';

// ── Image ────────────────────────────────────────────────────────────────────

export interface IImage extends Document {
  file_id: string;
  file_url: string;
  userId?: mongoose.Types.ObjectId;
  shopId?: mongoose.Types.ObjectId;
}

const ImageSchema = new Schema<IImage>(
  {
    file_id: { type: String, required: true },
    file_url: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
  },
  { timestamps: true },
);

export const ImageModel =
  mongoose.models.Image || mongoose.model<IImage>('Image', ImageSchema);

// ── User ─────────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  following: string[];
  avatar?: mongoose.Types.ObjectId; // ref to Image _id
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    following: { type: [String], default: [] },
    avatar: { type: Schema.Types.ObjectId, ref: 'Image' },
  },
  { timestamps: true },
);

export const UserModel =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// ── Shop ─────────────────────────────────────────────────────────────────────

export interface IShop extends Document {
  name: string;
  bio?: string;
  category: string;
  avatar?: mongoose.Types.ObjectId; // ref to Image _id
  sellerId: mongoose.Types.ObjectId; // Single owner of this shop
  createdAt: Date;
  updatedAt: Date;
}

export type IShops = IShop; // Backwards compatibility alias

const ShopSchema = new Schema<IShop>(
  {
    name: { type: String, required: true },
    bio: { type: String },
    category: { type: String },
    avatar: { type: Schema.Types.ObjectId, ref: 'Image' },
    sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
  },
  { timestamps: true },
);

export const ShopModel =
  mongoose.models.Shop || mongoose.model<IShop>('Shop', ShopSchema);

// ── Seller ───────────────────────────────────────────────────────────────────

export interface ISeller extends Document {
  name: string;
  email: string;
  phone_number: string;
  country: string;
  password: string;
  stripeId?: string;
  shops: mongoose.Types.ObjectId[]; // One seller can own/manage multiple shops
  createdAt: Date;
  updatedAt: Date;
}

const SellerSchema = new Schema<ISeller>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone_number: { type: String, required: true },
    country: { type: String, required: true },
    password: { type: String, required: true },
    stripeId: { type: String },
    shops: [{ type: Schema.Types.ObjectId, ref: 'Shop', default: [] }],
  },
  { timestamps: true },
);

export const SellerModel =
  mongoose.models.Seller || mongoose.model<ISeller>('Seller', SellerSchema);
