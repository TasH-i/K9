import mongoose, { Document, Schema } from "mongoose";

export interface IProductAttribute {
  name: string;
  value: string;
}

export interface IProductOption {
  name: string;
  values: string[];
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  oldPrice: number;
  sku: string;
  stock: number;
  brand: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  thumbnail: string;
  images: string[];
  attributes: IProductAttribute[];
  options: IProductOption[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  isTodayDeal: boolean;
  isComingSoon: boolean;
  isCouponDeal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Product name must be at least 3 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      sparse: true, // ADDED: Allow multiple null values
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    shortDescription: {
      type: String,
      maxlength: [500, "Short description must be less than 500 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    oldPrice: {
      type: Number,
      default: 0,
      min: [0, "Old price cannot be negative"],
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      sparse: true, // ADDED: Allow multiple null values
      uppercase: true,
      trim: true,
      index: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: [true, "Brand is required"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    thumbnail: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    attributes: [
      {
        name: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
      },
    ],
    options: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        values: [
          {
            type: String,
            required: true,
            trim: true,
          },
        ],
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be greater than 5"],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, "Review count cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTodayDeal: {
      type: Boolean,
      default: false,
    },
    isComingSoon: {
      type: Boolean,
      default: false,
    },
    isCouponDeal: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto-generate slug from name
ProductSchema.pre("validate", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

// ADDED: Post-delete hook to cleanup indexes
ProductSchema.post(
  "findOneAndDelete",
  async function (doc) {
    if (doc) {
      console.log(`Product deleted: ${doc.name} (slug: ${doc.slug})`);
      // The document is deleted, and with sparse index, the slug entry is automatically cleaned up
    }
  }
);

// Index for better query performance
ProductSchema.index({ name: "text", sku: 1, brand: 1, category: 1 });

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);