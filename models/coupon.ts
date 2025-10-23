import mongoose, { Document, Schema } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discountPercentageValue: number;
  applicableCategories: mongoose.Types.ObjectId[];
  applicableBrands: mongoose.Types.ObjectId[];
  applicableProducts: mongoose.Types.ObjectId[];
  usageCount: number;
  startDate: Date | string;
  endDate: Date | string;
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean;
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
      default: 0,
      min: 0,
    },
    discountPercentageValue: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
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
    applicableProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
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
  },
  { timestamps: true }
);

// Add virtual field for isActive computed status
CouponSchema.virtual("isActive").get(function (this: ICoupon) {
  const now = new Date();
  const startDate = new Date(this.startDate);
  const endDate = new Date(this.endDate);
  return now >= startDate && now <= endDate;
});

// Ensure virtuals are included when converting to JSON
CouponSchema.set("toJSON", { virtuals: true });
CouponSchema.set("toObject", { virtuals: true });

export default mongoose.models.Coupon ||
  mongoose.model<ICoupon>("Coupon", CouponSchema);