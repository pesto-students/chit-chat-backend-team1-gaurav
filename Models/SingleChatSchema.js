const mongoose = require("mongoose");

let requiredstring = { type: String, required: true };

const SingleChat = mongoose.Schema({
  membersArray: Array,
  messageArray: Array,
  chatInfo: Object,
  imagesArray: Array,
  documentArray: Array,
});

module.exports = mongoose.model("singlechats", SingleChat);
