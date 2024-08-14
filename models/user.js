const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  podcasts: [
    {
      type: mongoose.Types.ObjectId,
      ref: "podcast",
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("user", userSchema);