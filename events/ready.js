import { ActivityType } from "discord.js";
import { client } from "../bot.js";
import mongoose from "mongoose";

/**
 * Event listener for when the client becomes ready.
 * This event is emitted once the bot has successfully connected to Discord and is ready to start receiving events.
 * @event client#ready
 */
client.on("ready", async () => {
  try {
    // Login to the MongoDB database
    // mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGODB_URI || '', {
    })
    if (mongoose.connect) {
      console.log("> ✅ Connected to the database");
    }
    else {
      console.log("> ❌ Unable to connect to the database");
    }

    // Log a message indicating that the client is ready
    console.log(`> ✅ ${client.user.tag} is now online`);

    // Set the activity for the client
    client.user.setActivity({
      name: `Summer Things`, // Set the activity name
      type: ActivityType.Streaming, // Set the activity type
      url: "https://www.youtube.com/watch?v=xvFZjo5PgG0"
    });
  } catch (error) {
    // Log any errors that occur
    console.error("An error occurred in the ready event:", error);
  }
});

/**
 * Sets the bot's presence and activity when it becomes ready.
 * @module ReadyEvent
 */


