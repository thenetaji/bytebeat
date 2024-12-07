import * as cheerio from "cheerio";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { GOOGLE_CLOUD_KEY } from "./index.js";

/**
 * @params {String} videoId - A unique identifier of a song (YouTube video ID).
 * @params {Array} link_array - An array of links.
 */
export async function saveToDB(videoId, link_array) {
  const client = new DynamoDBClient({ region: "ap-south-1" });
  const dynamoDB = DynamoDBDocumentClient.from(client);

  try {
    const params = {
      TableName: "Music_urls",
      Item: {
        videoId,
        items: link_array,
      },
    };
    await dynamoDB.send(new PutCommand(params));
  } catch (err) {
    console.error("Error saving to DB:", err);
    throw new Error("Failed to save data to DynamoDB");
  }
}

/**
 * A utility function to parse music files from an array of links.
 * @type {Array<string>} links - Array of links to be sorted.
 * @returns {Object} - An object with two properties: `urls` and `sourceSite`.
 */
export async function extractAudioLinks(links) {
  try {
    for (const link of links) {
      const currentLink = link.url;

      const site = await fetch(currentLink);
      const response = await site.text();
      const $ = cheerio.load(response);

      const parsedLinks = [];
      $("a").each((_, element) => {
        const href = $(element).attr("href");
        const title = $(element).text().trim();
        if (href && title) parsedLinks.push({ href, title });
      });

      const filteredLinks = parsedLinks.filter((link) =>
        [".mp3", ".webm", ".ogg", ".wav", ".flac"].some((word) =>
          link.href.toLowerCase().includes(word),
        ),
      );

      if (filteredLinks.length === 0) continue;

      const sourceSite = new URL(currentLink).origin;
      return {
        urls: filteredLinks,
        sourceSite,
      };
    }
  } catch (err) {
    console.error("Error parsing links:", err);
    throw new Error("Error parsing links from site");
  }
}

/**
 * A utility function to parse music files from an array of links and save to DB.
 * @params {String} query - Song query.
 * @params {Array<string>} links - Array of links to be sorted.
 * @returns {Promise<void>}
 */
export async function extractAndSaveAllLinks(query, _totalLinks) {
  let _links = [];

  try {
    for (const link of _totalLinks) {
      const currentLink = link.url;

      try {
        const site = await fetch(currentLink);
        const response = await site.text();
        const $ = cheerio.load(response);

        const parsedLinks = [];
        $("a").each((_, element) => {
          const href = $(element).attr("href");
          const title = $(element).text().trim();
          if (href && title) parsedLinks.push({ href, title });
        });

        const filteredLinks = parsedLinks
          .filter((link) =>
            [".mp3", ".webm", ".ogg", ".wav", ".flac"].some((word) =>
              link.href.toLowerCase().includes(word),
            ),
          )
          .map((item) => ({
            ...item,
            source: new URL(currentLink).origin,
          }));

        _links.push(...filteredLinks);
      } catch (siteErr) {
        console.error(`Error processing site: ${currentLink}`, siteErr);
      }
    }

    const fetchVideoId = async (query) => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}+official+music+video&type=video&videoCategoryId=10&order=relevance&maxResults=1&key=${GOOGLE_CLOUD_KEY}`,
        );

        if (!response.ok)
          throw new Error(`YouTube API error: ${response.status}`);

        const data = await response.json();
        return data?.items[0]?.id?.videoId || null;
      } catch (youtubeErr) {
        console.error("Error fetching video ID:", youtubeErr);
        return null;
      }
    };

    const videoId = await fetchVideoId(query);
    if (videoId) {
      await saveToDB(videoId, _links);
    }
  } catch (err) {
    console.error("Error in extractAndSaveAllLinks:", err);
    throw new Error("Error while extracting and saving links");
  }
}
