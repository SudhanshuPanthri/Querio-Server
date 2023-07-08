import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserSchema from "../models/user.js";

const hash = bcrypt.genSaltSync(10);
const jwtSecret = "agshdhagsjfsajflks";
// const token = null;

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await UserSchema.findOne({ email });
    if (existingUser) {
      return res.status(404).json({ message: "User already Exists" });
    }
    console.log(name, email, password);
    const User = await UserSchema.create({
      name,
      email,
      password: bcrypt.hashSync(password, hash),
    });
    // const token = jwt.sign({ email, id: User._id }, "test", {
    //   expiresIn: "1h",
    // });
    res.status(200).json({ User });
  } catch (e) {
    res.status(422).json(e);
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const User = await UserSchema.findOne({ email });
    if (!User) {
      return res.status(404).json({ message: "User does not exist" });
    }
    const passOkay = bcrypt.compareSync(password, User.password);
    if (!passOkay) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    jwt.sign(
      { email, id: User._id },
      jwtSecret,
      {
        // expiresIn: "1h",
      },
      (err, token) => {
        if (err) throw new err();
        res.cookie("token", token).json(User);
      }
    );
    // res.(200).cookie({ User, token });
  } catch (error) {
    res.status(422).json(error);
  }
};

export const profile = async (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, tokenData) => {
      if (err) throw err;
      const { name, email, _id } = await UserSchema.findById(tokenData.id);
      res.json({ name, email, _id });
    });
  } else {
    res.json(null);
  }
};
