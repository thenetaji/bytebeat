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
    const client = new ApifyClient({
      token: APIFY_API,
    });

    const input = {
      queries: `download ${query} song 320kbps`,
      resultsPerPage: 20,
      maxPagesPerQuery: 1,
    };

    const run = await client.actor("nFJndFXA5zjCTuudP").call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    const searchResults = items[0]?.organicResults || [];
    if (searchResults.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "No search results found." }),
      };
    }

    const filteredLinks = await extractAudioLinks(searchResults);
    
    /**
     * Saving to dynamoDB by invoking a lambda function
     */
    const client = new LambdaClient({ region: "ap-south-1" });
    const params = {
      FunctionName: "tunevault-saveToDynamo",
      Payload: JSON.stringify({ query, searchResults });
    };
    const command = new InvokeCommand(params);
    const response = await client.send(params);

    const formattedUrls = filteredLinks.urls
      .map((item) => item.href)
      .join("\n");

    const genAI = new GoogleGenerativeAI(GOOGLE_CLOUD_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Extract the highest quality valid download URL from the list below. 
          Ignore links related to ringtones or low-quality songs. Provide only the best valid download URL.
          - Base URL: ${filteredLinks.sourceSite}
          - URLs: ${formattedUrls}
        `;

    const result = await model.generateContent(prompt);
    const data = result.response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ data }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
