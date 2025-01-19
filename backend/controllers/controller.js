import downloadBySearch from "../services/scrapper-downloader.js";
import { saveDataToTable } from "../db/postgres.js";
import { logger as log } from "../utils/logger.js";

/**
 * Handles meta information for a request
 */
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

async function metaHandler(req, res) {
  const { query } = req.query;
  log.http({
    title: "Req received in metaHandler",
    query,
  });
  
  if(!query){
    return res.status(500).json({
      success: false,
      error: true,
      message: "URL is not provided or invalid",
      data: {},
    });
  }; 

  try {
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}+official+music+video&type=video&videoCategoryId=10&order=relevance&maxResults=1&key=${YOUTUBE_API_KEY}`,
    );
    const data = await response.json();

    log.debug("Received data from YouTube API:", data);

    const videoItem = await data?.items?.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high,
      channelTitle: item.snippet.channelTitle,
    }));

    await saveDataToTable(videoItem[0]);

    log.verbose("Processed video item:", videoItem);

    return res.status(200).json({
      status: true,
      error: false,
      message: "Data sent successfully!!",
      data: {
        videoItem,
      },
    });
  } catch (error) {
    log.error("Error in fetching meta", error);
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
  log.http({
    title: "downloadHandler",
    query,
  })

  try {
    await downloadBySearch(query, res);
  } catch (error) {
    log.error("Error in downloading content", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message,
      data: {},
    });
  }
}

export { metaHandler, downloadHandler };
