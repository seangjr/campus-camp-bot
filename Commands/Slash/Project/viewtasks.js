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
    const departmentId = department ? settings.departments[department].roleId : null;
    const departmentTitle = department ? department.charAt(0).toUpperCase() + department.slice(1).replace(/([A-Z])/g, ' $1').trim() : null;

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
            Object.entries(settings.departments).map(([key, value]) => ({
              // format the key to title case and add space if needed
              name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
              value: tasks
                .filter((task) => task.department === value.roleId && !task.completed) // filter out completed tasks
                .map((task) => `🚨 **${task.task}**\n📅 Due **${moment(task.dueDate).fromNow()}**\n⚠️ Status: ${task.completed ? "**Completed**" : "**Pending Completion**"}\n✅ Percentage Completed: **${task.percentageCompleted}%**`)
                .join("\n\n") || "No tasks",
            }))
          )
          .setColor("Random");

        await client.send(interaction, {
          embeds: [embed],
        });
      }
    }
    else {
      const tasks = await taskModel.find({ guildID: interaction.guild.id, department: departmentId });
      if (!tasks.length) {
        return interaction.reply(`No tasks found for <@&${departmentId}>.`);
      }
      else {
        const embed = new EmbedBuilder()
          .setTitle(`${departmentTitle} Tasks`)
          .addFields(
            tasks
              .filter(task => !task.completed)
              .map((task) => ({
                name: task.task,
                value: `📅 Due **${moment(task.dueDate).fromNow()}**\n⚠️ Status: ${task.completed ? "**Completed**" : "**Pending Completion**"}\n✅ Percentage Completed: **${task.percentageCompleted}%**`,
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
