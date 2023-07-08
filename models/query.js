import mongoose from "mongoose";

const querySchema = mongoose.Schema({
  author: { type: String },
  authorId: { type: String },
  title: { type: String, required: "Query must have a title" },
  body: { type: String, required: "Query must have a description" },
  tags: { type: [String] },
  noOfAnswers: { type: Number, default: 0 },
  upVotes: { type: [String], default: [] },
  downVotes: { type: [String], default: [] },
  askedOn: { type: Date, default: Date.now },
  answer: [
    {
      answerBody: String,
      userAnswered: String,
      userId: { type: mongoose.Schema.Types.ObjectId },
      answeredOn: { type: Date, default: Date.now },
      upVotes: { type: [String], default: [] },
      downVotes: { type: [String], default: [] },
    },
  ],
});

export default mongoose.model("QueryModel", querySchema);
