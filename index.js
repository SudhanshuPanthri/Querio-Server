import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import UserSchema from "./models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import QueryModel from "./models/query.js";

const app = express();
const PORT = process.env.PORT || 3000;
const hash = bcrypt.genSaltSync(10);
const jwtSecret = "agshdhagsjfsajflks";
dotenv.config();

//middleware
app.use(express.json({ limit: "30mb", extended: true }));
app.use(cookieParser());
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(
  cors({
    credentials: true,
    origin: "http://127.0.0.1:5173",
  })
);

// app.use("/user", userRoutes);

//ROUTES

//SIGNUP ROUTE ----->
app.post("/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await UserSchema.findOne({ email });
    if (existingUser) {
      return res.status(404).json({ message: "User already Exists" });
    }
    const User = await UserSchema.create({
      name,
      email,
      password: bcrypt.hashSync(password, hash),
    });
    res.status(200).json({ User });
  } catch (err) {
    res.status(433).json(e);
  }
});

//LOGIN ROUTE ----->

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const User = await UserSchema.findOne({ email });
  if (User) {
    const passOkay = bcrypt.compareSync(password, User.password);
    if (passOkay) {
      jwt.sign(
        { name: User.name, email: User.email, id: User._id },
        jwtSecret,
        {},
        (err, token) => {
          if (err) throw new err();
          res
            .cookie("token", token, {
              httpOnly: true,
              sameSite: "none",
              secure: true,
            })
            .json({ token, User });
        }
      );
    } else {
      res.json("not ok");
    }
  } else {
    res.json("Not Found");
  }
});

app.use("/test", (req, res) => {
  res.json("Test");
});

//API TO ASK A QUERY----->

app.post("/askQuery", (req, res) => {
  const { token, author, authorId, title, body, tags } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, tokenData) => {
    if (err) throw err;
    const queryDoc = await QueryModel.create({
      owner: tokenData.id,
      author,
      authorId,
      title,
      body,
      tags,
    });
    res.json(queryDoc);
  });
});

//GETTING ALL THE QUERIES FROM DATABASE----->

app.get("/getQueries", async (req, res) => {
  const data = await QueryModel.find();
  res.json(data);
});

//GETTING PARTICULAR QUERY FROM DB------->

app.get("/getQueries/:id", async (req, res) => {
  const { id } = req.params;
  let data = await QueryModel.findById(id);
  res.json(data);
});

//POSTING ANSWER TO A QUERY------->

app.post("/postAnswer", async (req, res) => {
  const { id, answerBody, userId, userAnswered } = req.body;
  if (!id) return res.json("Invalid Question");
  try {
    const updatedQuery = await QueryModel.findByIdAndUpdate(id, {
      $addToSet: { answer: [{ answerBody, userId, userAnswered }] },
    });
    await QueryModel.findByIdAndUpdate(id, { $set: { answer } });
    try {
      await UserSchema.update(
        { userId },
        { $inc: { noOfQueryAnswered: 1 } },
        { multi: true }
      );
    } catch (err) {
      throw new err();
    }
    console.log(updatedUser);
    res.json(updatedUser);
  } catch (err) {
    res.json({ message: err.message });
  }
});

//SETTING UPVOTE ------>
app.post("/getQueries/:id/upVotes", async (req, res) => {
  const { id, userId } = req.body;
  try {
    // await QueryModel.findByIdAndUpdate(id, {
    //   $addToSet: {
    //     upVotes: [userId],
    //   },
    // });
    // await QueryModel.findByIdAndUpdate(id, { $set: { upVotes } });
    // const updatedQuery = await QueryModel.updateOne(
    //   { id },
    //   { $inc: { upVotes: 1 } }
    // );
    console.log(updatedUser);
    // res.json(updatedQuery);
  } catch (err) {
    res.json({ message: err.message });
  }
});

//DELETE A QUERY
app.post("/deleteQuery/:id", async (req, res) => {
  const { token } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, tokenData) => {
    if (err) throw err;
    const { id } = req.params;
    res.json(await QueryModel.deleteOne({ _id: id }));
  });
});

// DELETE A ANSWER
app.post("/deleteAnswer/:id", async (req, res) => {
  const { token, userId } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, tokenData) => {
    if (err) throw err;
    const { id } = req.params;
    let updatedQuery = await QueryModel.updateOne(
      { _id: id },
      { $pull: { answer: { userId: userId } } }
    );
    res.json(updatedQuery);
  });
});

app.get("/topContributors", async (req, res) => {
  await res.json(await UserSchema.find());
});

//GET USER
app.get("/user/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  await res.json(await UserSchema.findOne({ _id: id }));
});

//UPDATE USER BIO
app.post("/updateBio", async (req, res) => {
  const { id, bio } = req.body;
  res.json(await UserSchema.findByIdAndUpdate(id, { $set: { about: bio } }));
});

//CONNECTING MONGODB

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server Started At PORT ${PORT}`);
    });
  })
  .catch((err) => console.log(err.message));
