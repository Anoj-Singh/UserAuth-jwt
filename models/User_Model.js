const mongoose = require("mongoose");

const User_Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  user_type: {
    type: String,
    required: true,
  },
  is_assigned: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("User", User_Schema);
