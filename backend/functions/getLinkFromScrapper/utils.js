import * as cheerio from "cheerio";

/**
 * A utility function to parse music files from an array of links
 * @type {Array<string>} links - array of links to be sorted
 * @returns {Object} - An object with two properties :- urls and sourceSite
 * @returns {Object<Array>} urls contain two keys:
 * - {String} href - The source URI
 * - {String} text - Title of the anchor tag
 * @returns {Object<String>} sourceSite - The site from where the link was extracted
 */
async function extractAudioLinks(links) {
  try {
    for (const link of links) {
      const currentLink = link.url;
      console.log("Processing site:", currentLink);

      const site = await fetch(currentLink);
      const response = await site.text();

      const $ = cheerio.load(response);

      /**
       * An array to store the
       * parsed links from the
       * site
       */
      const links = [];
      $("a").each((_, element) => {
        const href = $(element).attr("href");
        const title = $(element).text().trim();
        if (href && title) links.push({ href, title });
      });

      const filteredLinks = links.filter((link) =>
        [".mp3", ".webm", ".ogg", ".wav", ".flac"].some((word) =>
          link.href.toLowerCase().includes(word),
        ),
      );

      if (filteredLinks == 0) {
        console.warn(
          "No links found on this site" + currentLink + " Trying other site...",
        );
        /**
         * Continue parsing links
         * until valid link is found
         * or all links gets
         * exhausted and if
         * successfull return the
         * value
         */
        continue;
      }

      const sourceSite = new URL(currentLink);
      return {
        urls: filteredLinks,
        sourceSite: sourceSite.origin,
      };
    } /**loop ends here**/
  } catch (err) {
    console.error("Error in parsing links", err);
    throw new Error("Error parsing links from site");
  }
}

export { extractAudioLinks };
