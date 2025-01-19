import * as cheerio from "cheerio";
import { GOOGLE_CLOUD_KEY } from "./index.js";

/**
 * A utility function to parse music files from an array of links.
 * @type {Array<string>} links - Array of links to be sorted.
 * @returns {Object} - An object with two properties: `urls` and `sourceSite`.
 */
export async function extractAudioLinks(links) {
  console.time("Utils timing");
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
      console.timeEnd("Utils timing");

      //if a page dont have any link it will proceed to another page and if not it returns the links
      if (filteredLinks.length === 0) continue;

      //gives base url by removing all sub-parts
      const sourceSite = new URL(currentLink).origin;
      return {
        urls: filteredLinks,
        sourceSite, //returning origin of the links so as to send it to the AI model to construct complete as some sites have relative urls
      };
    }
  } catch (err) {
    console.error("Error parsing links:", err);
    throw new Error("Error parsing links from site");
  }
}
