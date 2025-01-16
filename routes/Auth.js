const express = require("express");
const { createUser, loginUser, checkAuth } = require("../controller/Auth");
const passport = require("passport");

const router = express.Router();

// /auth is already added in the base path
router
  .post("/signup", createUser)
  .post("/login", (req, res, next) => {
    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Internal Server Error", error: err });
      }
      if (!user) {
        return res
          .status(401)
          .json({ message: info.message || "Invalid credentials" });
      }
      req.login(user, { session: false }, (loginErr) => {
        if (loginErr) {
          return res
            .status(500)
            .json({ message: "Failed to log in", error: loginErr });
        }
        loginUser(req, res, next); // Your login logic
      });
    })(req, res, next);
  })
  .get("/check", (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Internal Server Error", error: err });
      }
      if (!user) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Token is invalid or expired" });
      }
      req.user = user; // Attach user to request
      checkAuth(req, res, next); // Your checkAuth logic
    })(req, res, next);
  });

exports.router = router;
