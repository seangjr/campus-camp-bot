import "dotenv/config";
import { Bot } from "./handlers/Client.js";
import http from "http";

/**
 * The client instance representing the bot.
 * @type {Bot}
 */
export const client = new Bot();

// Login the bot using the provided token
client.build(client.config.TOKEN);
/**
 * Initializes and logs in the bot.
 * @module BotInitialization
 */

const port = process.env.PORT || 3000;
const requestListener = (req, res) => {
  res.writeHead(200);
  res.end("Bot is running.");
};
const server = http.createServer(requestListener);
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("An uncaught exception occurred:", error);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("An unhandled promise rejection occurred:", error);
});
