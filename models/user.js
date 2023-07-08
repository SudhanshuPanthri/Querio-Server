import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  about: { type: String, default: "" },
  joinedOn: { type: Date, default: Date.now },
  noOfQueryAnswered: { type: Number, default: 0 },
});

export default mongoose.model("UserModel", userSchema);
