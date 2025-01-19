import { ApifyClient } from "apify-client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractAudioLinks } from "./utils.js";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

export const GOOGLE_CLOUD_KEY = process.env.GOOGLE_CLOUD_KEY;
export const APIFY_API = process.env.APIFY_API;

export const handler = async (event) => {
  const body = JSON.parse(event.body);
  const query = body.query;
  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Query parameter is required." }),
    };
  }

  try {
    console.time("Apify timing");
    const client = new ApifyClient({
      token: APIFY_API,
    });

    const input = {
      queries: `download ${query} song 320kbps`,
      resultsPerPage: 20,
      maxPagesPerQuery: 1,
    };

    //apify's google search result scrapper actor
    const run = await client.actor("apify/google-search-scraper").call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.timeEnd("Apify timing");

    /**under items it returns many objects but we need organicResults which contains all the search results**/
    const searchResults = items[0]?.organicResults || [];
    if (searchResults.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "No search results found." }),
      };
    }

    //extracts all mp3 links
    const filteredLinks = await extractAudioLinks(searchResults);

    /**
     * Saving to dynamoDB by invoking a lambda function so as to have a music library
     * You can skip this or remove this functionality
     * It calls a lambda whose job is to save to db i used this because if i used here it would slow the application
     */
    const saveToDatabse_Lambda = async (filteredLinks) => {
      console.time("DB saving time");
      const client = new LambdaClient({ region: "ap-south-1" });
      const params = {
        FunctionName: "tunevault-saveToDynamo",
        Payload: JSON.stringify({
          source: filteredLinks.sourceSite,
          links: filteredLinks,
        }),
      };
      const command = new InvokeCommand(params);
      const response = await client.send(command);
      console.timeEnd("DB saving time");
    };
    saveToDatabse_Lambda(filteredLinks);

    const formattedUrls = filteredLinks.urls
      .map((item) => item.href)
      .join("\n");

    //get your api key at google ai studio for free
    console.time("AI timing");
    const genAI = new GoogleGenerativeAI(GOOGLE_CLOUD_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Please extract the highest quality valid download URL from the list provided. Ignore lower quality options and return only the best valid download URL.
    Base URL: ${filteredLinks.sourceSite}
    URLs: ${formattedUrls}`;

    const result = await model.generateContent(prompt);
    const data = result.response.text();
    console.timeEnd("AI timing");

    return {
      statusCode: 200,
      body: JSON.stringify({ data }),
    };
  } catch (error) {
    console.error("Error in process", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
