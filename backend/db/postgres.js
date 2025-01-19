import postgres from "postgres";
import { logger as log } from "../utils/logger.js";

const DATABASE_HOST =
  process.env.DATABASE_HOST;
const DATABASE_USER = process.env.DATABASE_USER;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
const DATABASE_NAME = process.env.DATABASE_NAME;

const sql = postgres({
  host: DATABASE_HOST,
  database: DATABASE_NAME,
  username: DATABASE_USER,
  password: DATABASE_PASSWORD,
  ssl: "require",
});

/**
 * Table name "Music_Metadata"
 */
export const saveDataToTable = async (item) => {
  try {
    await sql`
      INSERT INTO Music_Metadata (videoId, title, thumbnail, channelTitle)
      VALUES (${item.videoId}, ${item.title}, ${item.thumbnail}, ${item.channelTitle})
      ON CONFLICT (videoId) DO UPDATE
      SET 
        title = EXCLUDED.title,
        thumbnail = EXCLUDED.thumbnail,
        channelTitle = EXCLUDED.channelTitle;
    `;
    log.info("Data saved to DB (inserted or updated)");
  } catch (error) {
    log.error("An error occurred in saving data to DB", error);
  }
};
