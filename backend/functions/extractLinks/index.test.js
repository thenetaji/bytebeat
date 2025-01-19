/**
 * Used to test as a normal node app. means outside of lambda env.
 */
import { handler } from "./index.js";

(async () => {
  const event = {
    body: JSON.stringify({
      query: "lahra do",
    }),
  };

  try {
    // Start measuring performance
    console.time("Total Execution Time");

    const response = await handler(event);

    // End measuring performance and log the result
    console.timeEnd("Total Execution Time");

    console.info("Response:", response);
  } catch (error) {
    console.error("Error:", error.message);
  }
})();
