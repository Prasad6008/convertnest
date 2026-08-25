import mongoose from "mongoose";

const seoContentSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    seoTitle: {
      type: String,
      default: "",
      trim: true,
    },

    metaDescription: {
      type: String,
      default: "",
      trim: true,
    },

    h1: {
      type: String,
      default: "",
      trim: true,
    },

    seoContent: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const SeoContent = mongoose.model("SeoContent", seoContentSchema);

export default SeoContent;
