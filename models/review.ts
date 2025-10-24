// models/review.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  _id: string;
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number; // 1-5
  title?: string;
  reviewText: string;
  userEmail: string;
  userName: string;
  userAvatar?: string;
  productThumbnail?: string;
  productName: string;
  productVariant?: string;
  createdAt: Date;
  updatedAt: Date;
  isApproved: boolean; // Admin approval
}

const ReviewSchema: Schema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      enum: [1, 2, 3, 4, 5],
    },
    title: {
      type: String,
      trim: true,
    },
    reviewText: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 1000,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
      default: null,
    },
    productName: {
      type: String,
      required: true,
    },
    productVariant: {
      type: String,
      default: null,
    },
    isApproved: {
      type: Boolean,
      default: true, // Auto-approve for now, can be changed to false for moderation
    },
    productThumbnail: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews from the same user for the same product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Prevent multiple collections with the same name
const Review =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;