import express from 'express';

const router = express.Router();

// Make sure to load environment variables (your app entrypoint should have called dotenv.config())
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// Fetch MBA-related news
router.get("/news", async (req, res) => {
  try {
    // Accept language from query params, default to 'en'
    const language = req.query.language || "en";

    // NewsAPI supports 'language' param: https://newsapi.org/docs/endpoints/everything
    // MBA-related query
    const newsApiUrl = `https://newsapi.org/v2/everything?q=MBA+management+business+leadership&language=${encodeURIComponent(language)}&apiKey=${encodeURIComponent(
      NEWS_API_KEY
    )}`;

    const response = await fetch(newsApiUrl);

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to fetch news from NewsAPI." });
    }

    const data = await response.json();

    res.json({
      status: data.status,
      totalResults: data.totalResults,
      articles: data.articles,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news.", details: error.message });
  }
});

export default router;
