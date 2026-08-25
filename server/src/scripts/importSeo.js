import "dotenv/config";
import mongoose from "mongoose";
import path from "node:path";
import fs from "node:fs";
import XLSX from "xlsx";

import SeoContent from "../models/SeoContent.js";

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri) {
  console.error("❌ MongoDB URI not found in .env");
  process.exit(1);
}

const excelPath = path.resolve(
  "ConvertNest_SEO_Content(1).xlsx"
);

async function importSeo() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected");

    // Check Excel file
    if (!fs.existsSync(excelPath)) {
      console.error(`❌ Excel file not found: ${excelPath}`);
      process.exit(1);
    }

    // Read workbook
    const workbook = XLSX.readFile(excelPath);

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const rows = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📄 Found ${rows.length} rows`);

    if (!rows.length) {
      console.log("⚠️ No SEO data found in Excel");
      process.exit(0);
    }

    // Convert Excel columns to MongoDB fields
    const seoData = rows
      .map((row) => ({
        slug: String(row["Slug"] || "").trim(),
        seoTitle: String(row["SEO Title"] || "").trim(),
        metaDescription: String(row["Meta Description"] || "").trim(),
        h1: String(row["H1"] || "").trim(),
        seoContent: String(row["SEO Content"] || "").trim(),
      }))
      .filter((item) => item.slug);

    console.log(`✅ Valid SEO records: ${seoData.length}`);

    // Upsert records
    for (const item of seoData) {
      await SeoContent.findOneAndUpdate(
        { slug: item.slug },
        item,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    console.log("✅ SEO data imported successfully");
  } catch (error) {
    console.error("❌ SEO import failed:");
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
}

importSeo();
