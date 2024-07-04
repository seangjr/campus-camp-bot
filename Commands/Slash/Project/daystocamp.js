import { ApplicationCommandType } from "discord.js";
import moment from "moment";

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

    const campDate = moment("2024-09-14");
    const now = moment();
    const daysLeft = campDate.diff(now, "days");
    const weeksLeft = Math.floor(daysLeft / 7);

    await client.sendEmbed(interaction, `🏕️ There are ${daysLeft} days left to the camp. That's ${weeksLeft} weeks!`);
  },
};
