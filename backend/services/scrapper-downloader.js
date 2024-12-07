import { getFilename } from "../utils/filename.js";
import { pipeline } from "stream/promises";

/**
 * Function to download song from scraping search engines
 * @param {string} title - The title of the song to download
 * @param {Object} res - Response object passed by express.js
 * @returns {Promise<void>} - Resolves after the song is streamed to the response
 */
async function downloadBySearch(title, res) {
  const LAMBDA_URL = process.env.LAMBDA_URL;
  try {
    console.log("Fetching song data for title:", title);

    /**
     * Aws lambda URL of function tunevault-getlink-scrapper
     */
    const response = await fetch(
      LAMBDA_URL,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: title }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch song data from search API");
    }

    const { data } = await response.json();
    console.log("Received song URL data:", data);

    if (!data) {
      throw new Error("No song URL returned in response data");
    }

    /**
     * Fetching the song stream
     */
    console.log("Fetching the song stream from URL:", data);
    const songResponse = await fetch(data, { redirect: "follow" });

    if (!songResponse.ok) {
      throw new Error(`Failed to fetch song stream from URL: ${data}`);
    }

    const contentType =
      songResponse.headers.get("content-type") || "application/octet-stream";
    const contentLength = songResponse.headers.get("content-length") || 0;

    console.log(
      "Song stream metadata - Content-Type:",
      contentType,
      "Content-Length:",
      contentLength,
    );

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", contentLength);
    res.setHeader(
      "Content-Disposition",
      `attachment;filename="${getFilename(title, contentType)}"`,
    );

    const songStream = songResponse.body;

    /**
     * Using promise based pipeline
     */
    await pipeline(songStream, res);

    console.log("Song successfully streamed to response.");
  } catch (error) {
    console.error("Error in downloadBySearch:", error.message);
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message,
      data: {},
    });
  }
}

export default downloadBySearch;
