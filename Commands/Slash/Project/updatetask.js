import { ApplicationCommandType, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import settings from "../../../settings/config.js";
import { taskModel } from "../../../schema/task.js";
import moment from "moment";
import prettyMilliseconds from "pretty-ms";

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
    const departmentId = settings.departments[department].roleId;
    const tasks = await taskModel.find({ guildID: interaction.guild.id, department: departmentId });
    if (!tasks.length) {
      return interaction.reply(`No tasks found for ${department}.`);
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("task")
      .setPlaceholder("Select a task to update")
      .addOptions(
        tasks.map((task, index) => new StringSelectMenuOptionBuilder().setLabel(task.task).setValue(index.toString()))
      )

    const selectionRow = new ActionRowBuilder().addComponents(selectMenu);

    // first stage
    const updateTaskBtn = new ButtonBuilder()
      .setCustomId("updateTask")
      .setLabel("Update Task")
      .setStyle(ButtonStyle.Primary)

    const deleteTaskBtn = new ButtonBuilder()
      .setCustomId("deleteTask")
      .setLabel("Delete Task")
      .setStyle(ButtonStyle.Danger)

    const cancelBtn = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary)

    const firstStageRow = new ActionRowBuilder().addComponents(updateTaskBtn, deleteTaskBtn, cancelBtn);

    // update task actions
    const updateTaskName = new ButtonBuilder()
      .setCustomId("updateTaskName")
      .setLabel("Update Task Name")
      .setStyle(ButtonStyle.Primary)

    const updateTaskDueDate = new ButtonBuilder()
      .setCustomId("updateTaskDueDate")
      .setLabel("Update Task Due Date")
      .setStyle(ButtonStyle.Primary)

    const updateTaskStatus = new ButtonBuilder()
      .setCustomId("updateTaskStatus")
      .setLabel("Update Task Status")
      .setStyle(ButtonStyle.Primary)

    const updateTaskPercentage = new ButtonBuilder()
      .setCustomId("updateTaskPercentage")
      .setLabel("Update Task Percentage")
      .setStyle(ButtonStyle.Primary)

    const updateTaskRow = new ActionRowBuilder().addComponents(updateTaskName, updateTaskDueDate, updateTaskStatus, updateTaskPercentage);

    // delete task actions
    const confirmDeleteBtn = new ButtonBuilder()
      .setCustomId("confirmDelete")
      .setLabel("Confirm Delete")
      .setStyle(ButtonStyle.Danger)

    const cancelDeleteBtn = new ButtonBuilder()
      .setCustomId("cancelDelete")
      .setLabel("Cancel Delete")
      .setStyle(ButtonStyle.Secondary)

    const deleteTaskRow = new ActionRowBuilder().addComponents(confirmDeleteBtn, cancelDeleteBtn);

    await interaction.reply({
      components: [selectionRow],
    });

    const filter = (i) => i.customId === "task" && i.user.id === interaction.user.id; // filter for the select menu
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 }); // 10 seconds

    let taskIndex;

    collector.on("collect", async (i) => {
      const task = tasks[parseInt(i.values[0])];
      taskIndex = parseInt(i.values[0]);
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
      await i.message.edit({ components: [firstStageRow] });

    });

    collector.on("end", async (collected) => {
      if (!collected.size) {
        await interaction.editReply({ content: "No task selected. Cancelling...", components: [], embeds: [] })
      }
    })


    const firstStageInteractionFilter = (i) => ["updateTask", "deleteTask", "cancel"].includes(i.customId) && i.user.id === interaction.user.id;
    const firstStageInteractionCollector = interaction.channel.createMessageComponentCollector({ filter: firstStageInteractionFilter, time: 30000 });

    firstStageInteractionCollector.on("collect", async (i) => {
      if (i.customId === "updateTask") {
        await i.update({ content: "Updating task...", components: [updateTaskRow] });
      } else if (i.customId === "deleteTask") {
        await i.update({ content: "Deleting task...", components: [deleteTaskRow] });
      } else if (i.customId === "cancel") {
        await i.update({ content: "Cancelled.", components: [], embeds: [] });
      }
    });

    firstStageInteractionCollector.on("end", async (collected) => {
      if (!collected.size) {
        await interaction.editReply({ content: "No action selected. Cancelling...", components: [], embeds: [] })
      }
    })

    const deleteTaskFilter = (i) => ["confirmDelete", "cancelDelete"].includes(i.customId) && i.user.id === interaction.user.id;
    const deleteTaskCollector = interaction.channel.createMessageComponentCollector({ filter: deleteTaskFilter, time: 30000 });

    deleteTaskCollector.on("collect", async (i) => {
      if (i.customId === "confirmDelete") {
        try {
          await taskModel.findOneAndDelete({
            guildID: interaction.guild.id,
            department: departmentId,
            task: i.message.embeds[0].fields[0].value,
          }).then(async () => {
            await i.update({ content: "✅ Task deleted.", embeds: [], components: [] })
          })
        }
        catch (error) {
          console.error(error);
          return i.update({ content: "An error occurred while deleting the task.", components: [], embeds: [] });
        }
      } else if (i.customId === "cancelDelete") {
        await i.update({ content: "Cancelled.", components: [], embeds: [] });
      }
    })

    const updateTaskRowFilter = (i) => ["updateTaskName", "updateTaskDueDate", "updateTaskStatus", "updateTaskPercentage"].includes(i.customId) && i.user.id === interaction.user.id;
    const updateTaskRowCollector = interaction.channel.createMessageComponentCollector({ filter: updateTaskRowFilter, time: 30000 });

    updateTaskRowCollector.on("collect", async (i) => {
      if (i.customId === "updateTaskName") {
        await i.update({ content: "Updating task name...", components: [] });
        await i.followUp("Please enter the new task name.");

        const nameFilter = (m) => m.author.id === interaction.user.id;
        const nameCollector = interaction.channel.createMessageCollector({ filter: nameFilter, time: 30000 });

        nameCollector.on("collect", async (m) => {
          try {
            await taskModel.findOneAndUpdate({
              guildID: interaction.guild.id,
              department: departmentId,
              task: tasks[taskIndex].task,
            }, {
              task: m.content,
            }).then(async () => {
              await m.delete();
              await i.update({ content: "✅ Task name updated.", components: [], embeds: [] });
            })
          }
          catch (error) {
            console.error(error);
            return i.update({ content: "An error occurred while updating the task name.", components: [], embeds: [] });
          }
        })

        nameCollector.on("end", async (collected) => {
          if (!collected.size) {
            await interaction.editReply({ content: "No task name entered. Cancelling...", components: [], embeds: [] })
          }
        })
      } else if (i.customId === "updateTaskDueDate") {
        await i.update({ content: "Updating task due date...", components: [] });
        await i.followUp("Please enter the new task due date in `DD/MM/YYYY`.");

        const dueDateFilter = (m) => m.author.id === interaction.user.id;
        const dueDateCollector = interaction.channel.createMessageCollector({ filter: dueDateFilter, time: 30000 });

        dueDateCollector.on("collect", async m => {
          try {
            await taskModel.findOneAndUpdate({
              guildID: interaction.guild.id,
              department: departmentId,
              task: tasks[taskIndex].task,
            }, {
              dueDate: moment(m.content, "DD/MM/YYYY").toDate()
            }).then(async () => {
              await m.delete();
              await i.update({ content: "✅ Task due date updated.", components: [], embeds: [] });
            })
          }
          catch (error) {
            console.error(error);
            return i.update({ content: "An error occurred while updating the task due date.", components: [], embeds: [] });
          }
        })

        dueDateCollector.on("end", async (collected) => {
          if (!collected.size) {
            await interaction.editReply({ content: "No task due date entered. Cancelling...", components: [], embeds: [] })
          }
        })

        // while the collector is active
      } else if (i.customId === "updateTaskStatus") {
        await i.update({ content: "Updating task status...", components: [] });
        await i.followUp({
          content: "Select the new task status.",
          components: [
            new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId("completed")
                  .setLabel("Completed")
                  .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                  .setCustomId("pending")
                  .setLabel("Pending Completion")
                  .setStyle(ButtonStyle.Danger)
              )
          ]
        });

        // status collector
        const statusFilter = (i) => ["completed", "pending"].includes(i.customId) && i.user.id === interaction.user.id;
        const statusCollector = interaction.channel.createMessageComponentCollector({ filter: statusFilter, time: 30000 });

        statusCollector.on("collect", async (i) => {
          if (i.customId === "completed") {
            await taskModel.findOneAndUpdate({
              guildID: interaction.guild.id,
              department: departmentId,
              task: tasks[taskIndex].task
            }, { completed: true }).then(async () => {
              await i.update({ content: "✅ Task status updated.", components: [] });
            });
          } else if (i.customId === "pending") {
            await taskModel.findOneAndUpdate({
              guildID: interaction.guild.id,
              department: departmentId,
              task: tasks[taskIndex].task
            }, { completed: false }).then(async () => {
              await i.update({ content: "✅ Task status updated.", components: [] });
            });
          }
        })

        statusCollector.on("end", async (collected) => {
          if (!collected.size) {
            await interaction.editReply({ content: "No status selected. Cancelling...", components: [], embeds: [] })
          }
        })
      } else if (i.customId === "updateTaskPercentage") {
        await i.update({ content: "Updating task percentage...", components: [] });
        await i.followUp({
          content: "Please select the new completion percentage", components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("0")
                .setLabel("0%")
                .setStyle(ButtonStyle.Danger),
              new ButtonBuilder()
                .setCustomId("25")
                .setLabel("25%")
                .setStyle(ButtonStyle.Secondary),
              new ButtonBuilder()
                .setCustomId("50")
                .setLabel("50%")
                .setStyle(ButtonStyle.Secondary),
              new ButtonBuilder()
                .setCustomId("75")
                .setLabel("75%")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("100")
                .setLabel("100%")
                .setStyle(ButtonStyle.Success)
            )
          ]
        })

        // percentage collector
        const percentageFilter = (i) => ["0", "25", "50", "75", "100"].includes(i.customId) && i.user.id === interaction.user.id;
        const percentageCollector = interaction.channel.createMessageComponentCollector({ filter: percentageFilter, time: 30000 });

        percentageCollector.on("collect", async (i) => {
          await taskModel.findOneAndUpdate({
            guildID: interaction.guild.id,
            department: departmentId,
            task: tasks[taskIndex].task
          }, { percentageCompleted: parseInt(i.customId) }).then(async () => {
            await i.update({ content: "✅ Task percentage updated.", components: [] });
          });
        })

        percentageCollector.on("end", async (collected) => {
          if (!collected.size) {
            await interaction.editReply({ content: "No percentage selected. Cancelling...", components: [], embeds: [] })
          }
        })
      }
    })

    updateTaskRowCollector.on("end", async (collected) => {
      if (!collected.size) {
        await interaction.editReply({ content: "No action selected. Cancelling...", components: [], embeds: [] })
      }
    })

    const googleSheetsLinkButton = new ButtonBuilder()
      .setLabel("Google Sheets Link")
      .setStyle(ButtonStyle.Link)
      .setURL("https://docs.google.com/spreadsheets/d/1pBSD3s05hmIN7GLrTbwA5E9MOfB8AmNGAUkgSaeWO_E/edit?usp=sharing");
    await interaction.followUp({ content: "Make sure to update the google sheets as well for the changes to reflect.", components: [new ActionRowBuilder().addComponents(googleSheetsLinkButton)] });
  }
};
