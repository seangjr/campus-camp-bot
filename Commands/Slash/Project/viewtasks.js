import { ApplicationCommandType, EmbedBuilder } from "discord.js";
import settings from "../../../settings/config.js";
import { taskModel } from "../../../schema/task.js";
import moment from "moment";

/**
 * @type {import("../../../index.js").Scommand}
 */
export default {
  name: "viewtasks",
  description: "View all the tasks of a department or all.",
  userPermissions: ["SendMessages"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  category: "Project",
  options: [
    {
      name: "department",
      description: "The department to view tasks of.",
      type: 3,
      choices: Object.entries(settings.departments).map(([key, _]) => ({
        name: key,
        value: key,
      })),
      required: false,
    }
  ],
  type: ApplicationCommandType.ChatInput,

  run: async ({ client, interaction }) => {
    const department = interaction.options.getString("department")
    // parse camel case to title case and add space if needed
    const departmentTitle = department ? department.charAt(0).toUpperCase() + department.slice(1) : null;

    if (!department) {
      const tasks = await taskModel.find({ guildID: interaction.guild.id });
      if (!tasks.length) {
        return interaction.reply("No tasks found.");
      }
      else {
        const embed = new EmbedBuilder()
          .setTitle("Tasks")
          .addFields(
            // organize by department
            Object.entries(settings.departments).map(([key, _]) => ({
              // format the key to title case and add space if needed
              name: key.charAt(0).toUpperCase() + key.slice(1),
              value: tasks.filter((task) => task.department === key).map((task) => `🚨 **${task.task}** due *${moment(task.dueDate).fromNow()
                }* `).join("\n") || "No tasks",
            }))
          )
          .setColor("Random");

        await client.send(interaction, {
          embeds: [embed],
        });
      }
    }
    else {
      const tasks = await taskModel.find({ guildID: interaction.guild.id, department });
      if (!tasks.length) {
        return interaction.reply(`No tasks found for ${departmentTitle}.`);
      }
      else {
        const embed = new EmbedBuilder()
          .setTitle(`${departmentTitle} Tasks`)
          .addFields(
            tasks.map((task) => ({
              name: task.task,
              value: `Due *${moment(task.dueDate).fromNow()}*`,
            }))
          )
          .setColor("Random");

        await client.send(interaction, {
          embeds: [embed],
        });
      }
    }
  },
}
