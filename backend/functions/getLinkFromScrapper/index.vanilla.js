import { ApifyClient } from "apify-client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv/config";
import { extractAudioLinks, extractAndSaveAllLinks } from "./utils.js";
const APIFY_KEY = process.env.APIFY_KEY;
export const GOOGLE_CLOUD_KEY = process.env.GOOGLE_CLOUD_KEY;

async function getLinkFromScrapper(event) {
  console.info("Event received:", JSON.stringify(event));

  const body = JSON.parse(event.body);
  const query = body.query;
  if (!query) {
    console.error("No query parameter provided.");
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Query parameter is required." }),
    };
  }
  console.debug("Query parameter:", query);

  try {
    const client = new ApifyClient({
      token: APIFY_KEY,
    });
    console.debug("Apify client initialized.");

    const input = {
      queries: `download ${query} song 320kbps`,
      resultsPerPage: 20,
      maxPagesPerQuery: 1,
    };
    console.debug("Apify actor input:", input);

    const run = await client.actor("nFJndFXA5zjCTuudP").call(input);
    console.info("Apify actor run started:", run);

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    const searchResults = items[0]?.organicResults || [];
    console.info("Search results found:", searchResults);

    if (searchResults.length === 0) {
      console.warn("No search results found.");
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "No search results found." }),
      };
    }

    /**
     * Called the utility function 
       to extract valid link as well as save all links in DB
     */
    const filteredLinks = await extractAudioLinks(searchResults);
    await extractAndSaveAllLinks(query, searchResults);
    console.info("Filtered audio links:", filteredLinks);

    const formattedUrls = filteredLinks.urls
      .map((item) => item.href)
      .join("\n");
    console.debug("Formatted URLs for generative AI:", formattedUrls);

    const genAI = new GoogleGenerativeAI(
      "AIzaSyCgF0_1uRlK4W4fEo0whGXFPqWfDmMcMIk",
    );
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Extract the highest quality valid download URL from the list below. 
          Ignore links related to ringtones or low-quality songs. Provide only the best valid download URL.
          - Base URL: ${filteredLinks.sourceSite}
          - URLs: ${formattedUrls}
        `;
    console.debug("Prompt for generative AI:", prompt);

    const result = await model.generateContent(prompt);
    const data = result.response.text();
    console.log("Final Links", data);

    return {
      statusCode: 200,
      body: JSON.stringify({ data }),
    };
  } catch (error) {
    console.error("Error during processing:", error.message, error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
}

(async () => {
  const event = {
    body: JSON.stringify({
      query: "binding lights",
    }),
  };

  try {
    const response = await getLinkFromScrapper(event);
    console.log("Response:", response);
  } catch (error) {
    console.error("Error:", error.message);
  }
})();
