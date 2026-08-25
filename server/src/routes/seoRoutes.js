import express from "express";
import SeoContent from "../models/SeoContent.js";

const router = express.Router();

// GET SEO content by slug
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const seoContent = await SeoContent.findOne({ slug }).lean();

    if (!seoContent) {
      return res.status(404).json({
        success: false,
        message: "SEO content not found",
      });
    }

    res.json({
      success: true,
      data: seoContent,
    });
  } catch (error) {
    console.error("SEO API error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch SEO content",
    });
  }
});

export default router;
