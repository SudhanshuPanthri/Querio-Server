import express from "express";
import { login, signup, profile } from "../controllers/auth.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.get("/profile", profile);

export default router;
