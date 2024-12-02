import dotenv from "dotenv/config";
import downloadBySearch from "../services/scrapper-downloader.js";
import downloadByYoutube from "../services/youtube-downloader.js";

/**
 * Handles meta information for a request
 */
async function metaHandler(req, res) {
  const { query } = req.query;

  try {
    console.log("Fetching video metadata for query:", query);
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}+official+music+video&type=video&videoCategoryId=10&order=relevance&maxResults=1&key=${process.env.GOOGLE_CLOUD_KEY}`,
    );
    const data = await response.json();

    console.log("Received data from YouTube API:", data);

    const videoItem = await data.items.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high,
      channelTitle: item.snippet.channelTitle,
    }));

    console.log("Processed video item:", videoItem);

    return res.status(200).json({
      status: true,
      error: false,
      message: "Data sent successfully!!",
      data: {
        videoItem,
      },
    });
  } catch (error) {
    console.error("Error in fetching meta", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message,
      data: {},
    });
  }
}

async function downloadHandler(req, res) {
  const { query, method } = req.query;

  const downloadMethods = {
    search: downloadBySearch,
    youtube: downloadByYoutube,
  };

  console.log("Received download request with method:", method);

  if (!downloadMethods[method]) {
    console.error("Download method not found:", method);
    return res.status(400).json({
      success: false,
      error: true,
      message: "Download method is not defined...",
      data: {},
    });
  }

  const downloader = downloadMethods[method];

  try {
    console.log("Starting download with method:", method);
    await downloader(query, res);
    console.log("Download completed successfully.");
  } catch (error) {
    console.error("Error in downloading content", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message,
      data: {},
    });
  }
}

export { metaHandler, downloadHandler };