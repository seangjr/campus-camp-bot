
import { ApplicationCommandType } from "discord.js";

/**
 * @type {import("../../../index").Scommand}
 */
export default {
  name: "cleartext",
  description: "Clears all the text created by the bot in the channel.",
  userPermissions: ["SendMessages"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  category: "Misc",
  type: ApplicationCommandType.ChatInput,

  run: async ({ client, interaction }) => {

    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const botMessages = messages.filter(m => m.author.id === client.user.id);
    if (!botMessages.size) {
      return interaction.reply("No messages found.");
    }
    await interaction.channel.bulkDelete(botMessages, true);
    await interaction.reply({ content: "Cleared all the text messages created by the bot.", ephemeral: true })
  },
};
