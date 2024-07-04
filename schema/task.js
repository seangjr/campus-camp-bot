import { Schema, model } from 'mongoose';
const taskSchema = new Schema({
  _id: Schema.Types.ObjectId,
  guildID: String,
  department: String, // role id
  chatId: String,
  task: String,
  dateCreated: Date,
  dateCompleted: Date,
  dueDate: Date,
  percentageCompleted: Number,
  completed: Boolean,
})

export const taskModel = model("Task", taskSchema, "tasks");
