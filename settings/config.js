import { Colors } from "discord.js";

const settings = {
  TOKEN: process.env.TOKEN || "Bot_Token",
  PREFIX: process.env.PREFIX || "BotPrefix",
  Owners: ["832231777610629123"],
  Slash: {
    Global: false,
    GuildID: process.env.GuildID || "Guild_Id",
  },
  embed: {
    color: Colors.Blurple,
    wrongColor: Colors.Red,
  },
  emoji: {
    success: "✅",
    error: "❌",
  },
  departments: {
    general: {
      chatId: "1239603351994236996",
      roleId: "1239606239965745272"
    },
    logistics: {
      chatId: "1243034018971385887",
      roleId: "1239605985002127382",
    },
    games: {
      chatId: "1243034123069816905",
      roleId: "1239606061133070417",
    },
    design: {
      chatId: "1243034251461656677",
      roleId: "1239603351776264203",
    },
    creative: {
      chatId: "1243034409771208785",
      roleId: "1239603351776264204",
    },
    deco: {
      chatId: "1243034524376371260",
      roleId: "1239605865313472522",
    },
    marketing: {
      chatId: "1243034622187536404",
      roleId: "1239605927112347659",
    },
    socialMedia: {
      chatId: "1243034774709211219",
      roleId: "1239603351776264205",
    },
  }
}

export default settings;
