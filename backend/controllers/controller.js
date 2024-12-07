import dotenv from "dotenv/config";
import downloadBySearch from "../services/scrapper-downloader.js";
//import { saveDataToTable } from "../db/postgres.js";

/**
 * Handles meta information for a request
 */
export const GOOGLE_CLOUD_KEY = process.env.GOOGLE_CLOUD_KEY;
async function metaHandler(req, res) {
  const { query } = req.query;

  try {
    console.log("Fetching video metadata for query:", query);
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}+official+music+video&type=video&videoCategoryId=10&order=relevance&maxResults=1&key=${GOOGLE_CLOUD_KEY}`,
    );
    const data = await response.json();

    console.log("Received data from YouTube API:", data);

    const videoItem = await data?.items?.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high,
      channelTitle: item.snippet.channelTitle,
    }));
    
    //await saveDataToTable(videoItem[0]);

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
  const { query } = req.query;

  try {
    await downloadBySearch(query, res);
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
