import mongoose, { Document, Schema } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxDiscount: number | null;
  minPurchaseAmount: number;
  maxUsageCount: number | null;
  usageCount: number;
  applicableCategories: mongoose.Types.ObjectId[];
  applicableBrands: mongoose.Types.ObjectId[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, "Code must be at least 3 characters"],
    },
    description: {
      type: String,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: [true, "Discount type is required"],
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: 0,
    },
    maxDiscount: {
      type: Number,
      min: 0,
      default: null,
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxUsageCount: {
      type: Number,
      default: null,
      min: 1,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    applicableCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    applicableBrands: [
      {
        type: Schema.Types.ObjectId,
        ref: "Brand",
      },
    ],
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Coupon ||
  mongoose.model<ICoupon>("Coupon", CouponSchema);