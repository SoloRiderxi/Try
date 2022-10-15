import mongoose from "mongoose";
const { Schema, ObjectId } = mongoose;

const linkSchema = new Schema(
  {
    link: {
      type: String,
      trim: true,
      required: true,
    },
    title: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    urlPreview: {},
    postedBy: {
      type: ObjectId,
      ref: "User",
    },
    views: { type: Number, default: 0 },
    likes: [{ type: ObjectId, ref: "User" }],
  },

  { timestamps: true }
);

export default mongoose.model("Link", linkSchema);
