const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ckmbgSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
      enum: ["checkMySitter", "checkMyHealthProvider", "checkMyLuv"],
    },
    formDetails: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

const Ckmbg = mongoose.model("Ckmbg", ckmbgSchema);
module.exports = Ckmbg;
