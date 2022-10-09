const mongoose = require("mongoose");

let requiredstring = { type: String, required: true };

const UserSchema = mongoose.Schema({
  firstName: requiredstring,
  userName: requiredstring,
  email: requiredstring,
  phoneNumber: requiredstring,
  password: requiredstring,
  profileImg: String,
  singlecontacts: Array,
  groupcontacts: Array,
});

module.exports = mongoose.model("users", UserSchema);
