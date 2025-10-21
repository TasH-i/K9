import mongoose, { Document, Schema } from "mongoose";

export interface IProductAttribute {
  name: string;
  value: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice: number;
  cost: number;
  sku: string;
  stock: number;
  brand: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  images: string[]; // S3 URLs
  thumbnail: string; // S3 URL
  attributes: IProductAttribute[];
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
  };
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
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
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      maxlength: 500,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    comparePrice: {
      type: Number,
      min: 0,
    },
    cost: {
      type: Number,
      min: 0,
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      uppercase: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    thumbnail: {
      type: String,
      trim: true,
    },
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
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      length: {
        type: Number,
        min: 0,
      },
      width: {
        type: Number,
        min: 0,
      },
      height: {
        type: Number,
        min: 0,
      },
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

ProductSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);