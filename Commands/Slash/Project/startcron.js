import { ApplicationCommandType } from "discord.js";
import cron from "node-cron";
import cronStatus from "../../../cronStatus.js"
import settings from "../../../settings/config.js";
import { taskModel } from "../../../schema/task.js";
import moment from "moment";

/**
 * @type {import("../../../index").Scommand}
 */
export default {
  name: "startcron",
  description: "Start the cron job.",
  userPermissions: ["SendMessages"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  category: "Project",
  type: ApplicationCommandType.ChatInput,

  run: async ({ client, interaction }) => {
    if (cronStatus.value) {
      interaction.reply({ content: "Cron job is already running", ephemeral: true })
    }
    else {
      // Start the cron job
      cronStatus.value = true;

      interaction.reply({ content: "Cron job started", ephemeral: true });
      // remind each department in their respective channels for the tasks they have to do every day at 8:00 AM
      // 0 8 * * * means every day at 8:00 AM
      cron.schedule("0 8 * * *", async () => {
        const tasks = await taskModel.find({ guildID: interaction.guild.id, completed: false });
        // get each department and their respective channels, then send the tasks over 
        if (tasks.length) {
          for (const task of tasks) {
            const department = task.department;
            const channel = client.channels.cache.get(task.chatId)
            await channel.send(`<${department}> you have a pending task\n\n :rotating_light: **Task**: ${task.task}\n :date: **Due Date**: ${moment(task.dueDate)}\n :warning: **Status**: ${task.completed ? "**Completed**" : "**Pending Completion**"}\n :white_check_mark: **Percentage Completed**: ${task.percentageCompleted}%`)
          }
        }
      })
    }
  },
};
