import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/**
 * A utility function to parse music files from an array of links and save to DB.
 * @params {String} query - Song query.
 * @params {Array<string>} links - Array of links to be sorted.
 * @returns {Promise<void>}
 */
export const handler = async (event) => {
  const body = JSON.parse(event.body);
  const { source, links } = body;
  
  let _links = [];

  try {
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
      await saveToDB(videoId, links);
    }
  } catch (err) {
    console.error("Error in parsing and saving:", err);
    throw new Error("Error while extracting and saving links");
  }
}

 /**
 * @params {String} videoId - A unique identifier of a song (YouTube video ID).
 * @params {Array} link_array - An array of links.
 */
 const saveToDB = async (videoId,link_array) => {
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