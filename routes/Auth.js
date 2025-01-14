import express from "express";
import { createUser, loginUser, checkAuth } from "../controller/Auth.js";
import passport from "passport";

const router = express.Router();
//  /auth is already added in base path
router
  .post("/signup", createUser)
  .post("/login", passport.authenticate("local"), loginUser)
  .get("/check", passport.authenticate("jwt"), checkAuth);

export default router;
