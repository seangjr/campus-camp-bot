import { ApplicationCommandType } from "discord.js";

/**
 * @type {import("../../../index.js").Scommand}
 */
export default {
  name: "daystocamp",
  description: "Check the number of days remaining to the camp.",
  userPermissions: ["SendMessages"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  category: "Project",
  type: ApplicationCommandType.ChatInput,

  run: async ({ client, interaction }) => {
    // date of camp is 2024 September 14

    const campDate = new Date(2024, 9, 14);

    // current date
    const today = new Date();
    const daysLeft = Math.floor((campDate - today) / (1000 * 60 * 60 * 24));
    const weeksLeft = Math.floor(daysLeft / 7);

    await client.sendEmbed(interaction, `🏕️ There are ${daysLeft} days left to the camp. That's ${weeksLeft} weeks!`);
  },
};
