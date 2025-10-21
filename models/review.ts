import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  title: string;
  content: string;
  rating: number;
  author: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpful: number;
  unhelpful: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    title: {
      type: String,
      required: [true, "Review title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title must not exceed 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Review content is required"],
      minlength: [10, "Content must be at least 10 characters"],
      maxlength: [5000, "Content must not exceed 5000 characters"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      enum: [1, 2, 3, 4, 5],
      default: 5,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
      min: 0,
    },
    unhelpful: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Review ||
  mongoose.model<IReview>("Review", ReviewSchema);