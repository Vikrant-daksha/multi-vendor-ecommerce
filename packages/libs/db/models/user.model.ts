import mongoose, { Document, Schema } from "mongoose";

// ── Image ────────────────────────────────────────────────────────────────────

export interface IImage extends Document {
    file_id: string;
    file_url: string;
    userId?: string;
}

const ImageSchema = new Schema<IImage>(
    {
        file_id: { type: String, required: true },
        file_url: { type: String, required: true },
        userId: { type: String, unique: true, sparse: true },
    },
    { timestamps: true }
);

export const ImageModel =
    mongoose.models.Image || mongoose.model<IImage>("Image", ImageSchema);

// ── User ─────────────────────────────────────────────────────────────────────

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    following: string[];
    avatar?: string; // ref to Image _id
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        following: { type: [String], default: [] },
        avatar: { type: Schema.Types.ObjectId, ref: "Image" },
    },
    { timestamps: true }
);

export const UserModel =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
