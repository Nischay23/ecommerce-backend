import express from "express";
import { createUser, loginUser, checkUser } from "../controller/Auth.js";
import passport from "passport";

const router = express.Router();
//  /auth is already added in base path
router
  .post(
    "/signup",
    (req, res, next) => {
      console.log("Signup route hit"); // Debug log
      next();
    },
    createUser
  )
  .post("/login", passport.authenticate("local"), loginUser)
  .get("/check", passport.authenticate("jwt"), checkUser);

export default router;
