import { ApplicationCommandType, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder } from "discord.js";
import settings from "../../../settings/config.js";
import { taskModel } from "../../../schema/task.js";
import moment from "moment";

/**
 * @type {import("../../../index.js").Scommand}
 */
export default {
  name: "updatetask",
  description: "Update a task in the project.",
  userPermissions: ["SendMessages"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  category: "Project",
  options: [
    {
      name: "department",
      description: "The department of the task.",
      type: 3,
      choices: Object.entries(settings.departments).map(([key, _]) => ({
        name: key,
        value: key,
      })),
      required: true,
    },
  ],
  type: ApplicationCommandType.ChatInput,

  run: async ({ client, interaction }) => {
    const department = interaction.options.getString("department");
    const departmentTitle = department.charAt(0).toUpperCase() + department.slice(1);
    const tasks = await taskModel.find({ guildID: interaction.guild.id, department });
    if (!tasks.length) {
      return interaction.reply(`No tasks found for ${department}.`);
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("task")
      .setPlaceholder("Select a task to update")
      .addOptions(
        tasks.map((task, index) => new StringSelectMenuOptionBuilder().setLabel(task.task).setValue(index.toString()))
      )

    const actionRow = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      components: [actionRow],
    });

    const filter = (i) => i.customId === "task" && i.user.id === interaction.user.id; // filter for the select menu
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 10_000 }); // 10 seconds

    collector.on("collect", async (i) => {
      const task = tasks[parseInt(i.values[0])];
      const embed = new EmbedBuilder()
        .setTitle(`Update ${departmentTitle} Task`)
        .addFields(
          { name: "Task", value: task.task },
          { name: "Due Date", value: moment(task.dueDate).format("MMM Do YYYY") },
          { name: "Status", value: task.completed ? "Completed" : "Pending Completion" },
          { name: "Completion Percentage", value: `${task.percentageCompleted}%` },
        )
        .setColor("Random")
        .setTimestamp();
      await i.update({ embeds: [embed] })
      await i.message.edit({ components: [] });
    });
  }
};
