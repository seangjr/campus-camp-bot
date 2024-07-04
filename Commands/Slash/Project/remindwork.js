import { ApplicationCommandType } from "discord.js";
import moment from "moment";

/**
 * @type {import("../../../index.js").Scommand}
 */
export default {
  name: "remindwork",
  description: "Remind work for all departments.",
  userPermissions: ["SendMessages"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  category: "Project",
  type: ApplicationCommandType.ChatInput,

  run: async ({ client, interaction }) => {
    // trigger the reminder daily at current time

    const now = moment();
    const campDate = moment("2024-09-14");
  },
}
