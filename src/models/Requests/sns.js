const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const snsSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
      enum: ["private", "employee"],
    },
    formDetails: {
      type: Object,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    report: {
      type: String,
    },
  },
  { timestamps: true }
);

const Sns = mongoose.model("Sns", snsSchema);
module.exports = Sns;
