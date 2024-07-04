import { ApplicationCommandType, EmbedBuilder } from "discord.js";
import moment from "moment";
import settings from "../../../settings/config.js";
import { taskModel } from "../../../schema/task.js";
import mongoose from "mongoose";

/**
 * @type {import("../../../index").Scommand}
 */
export default {
  name: "createtask",
  description: "Create a task for a department.",
  userPermissions: ["SendMessages"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  category: "Project",
  options: [
    {
      name: "department",
      description: "The department to create the task for.",
      type: 3,
      choices: Object.entries(settings.departments).map(([key, _]) => ({
        name: key,
        value: key,
      })),
      required: true,
    },
    {
      name: "task",
      description: "The task to create. Case sensitive.",
      type: 3,
      required: true,
    },
    {
      name: "deadline",
      description: "The due date of the task. DD/MM/YYYY",
      type: 3,
      required: true,
    }
  ],
  type: ApplicationCommandType.ChatInput,

  run: async ({ client, interaction }) => {
    const department = interaction.options.getString("department");

    if (!department || !settings.departments[department]) {
      return interaction.reply("Please provide a valid department.");
    }

    const task = interaction.options.getString("task");
    const deadline = interaction.options.getString("deadline");

    // validate deadline 

    if (!moment(deadline, "DD/MM/YYYY").isValid()) {
      return interaction.reply("Please provide a valid deadline. (DD/MM/YYYY)");
    }

    // if the task name exists, then return
    if (await taskModel.findOne({ guildID: interaction.guild.id, department, task })) {
      return interaction.reply(`Task already exists for ${department}.`);
    }

    new taskModel({
      _id: new mongoose.Types.ObjectId(),
      guildID: interaction.guild.id,
      chatId: settings.departments[department].chatId,
      roleId: settings.departments[department].roleId,
      department,
      task,
      deadline,
      dateCreated: moment().toDate(),
      dateCompleted: null,
      dueDate: moment.utc(deadline, "DD/MM/YYYY").toDate(),
      percentageCompleted: 0,
      completed: false,
    }).save().catch(console.error);

    const embed = new EmbedBuilder()
      .setTitle("Task Created")
      .setDescription(`✅ Task created for ${department}.`)
      .addFields(
        {
          name: "Task",
          value: task,
        },
        {
          name: "Deadline",
          value: deadline,
        }
      )
      .setColor("Green")
      .setTimestamp();


    await client.send(interaction, { embeds: [embed] });
  },
};
