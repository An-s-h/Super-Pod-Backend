const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    unique: true,
    required: true,
  },
  podcasts: [
    {
      type: mongoose.Types.ObjectId,
      ref: "podcast",
    },
  ],
}, { timestamps: true });


module.exports = mongoose.model("category", categorySchema);
