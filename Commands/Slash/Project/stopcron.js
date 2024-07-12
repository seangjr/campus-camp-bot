
import { ApplicationCommandType } from "discord.js";
import cron from "node-cron";
import cronStatus from "../../../cronStatus.js"
import settings from "../../../settings/config.js";

/**
 * @type {import("../../../index").Scommand}
 */
export default {
  name: "stopcron",
  description: "Stop the cron job.",
  userPermissions: ["SendMessages"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  category: "Project",
  type: ApplicationCommandType.ChatInput,

  run: async ({ client, interaction }) => {
    if (cronStatus.value) {
      cronStatus.value = false;

      interaction.reply({ content: "Cron job stopped", ephemeral: true });
    }
    else {
      interaction.reply({ content: "Cron job is not running", ephemeral: true });
    }
  },
};
