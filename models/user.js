const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  phone: String,
  address: String,
  language: String,
  qualification: String,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
