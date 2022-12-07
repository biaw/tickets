import { Schema, model } from "mongoose";

const channelSchema = new Schema({
  guildId: { type: String, required: true },
  channels: { type: [String], required: true },
});

export default model("channels", channelSchema);
