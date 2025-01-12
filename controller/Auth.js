import { User } from "../model/User.js";
import crypto from "crypto";
import { sanitizeUser } from "../services/common.js";
const SECRET_KEY = "SECRET_KEY";
import jwt from "jsonwebtoken";

export async function createUser(req, res) {
  try {
    console.log("Request Body:", req.body); // Debug log
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(
      req.body.password,
      salt,
      310000,
      32,
      "sha256",
      async function (err, hashedPassword) {
        if (err) {
          console.error("Error hashing password:", err);
          return res.status(500).json({ message: "Password hashing failed" });
        }
        const user = new User({ ...req.body, password: hashedPassword, salt });
        const doc = await user.save();
        console.log("User created:", doc); // Debug log
        req.login(sanitizeUser(doc), (err) => {
          if (err) {
            console.error("Login error:", err);
            return res.status(400).json(err);
          } else {
            const token = jwt.sign(sanitizeUser(doc), SECRET_KEY);
            console.log("Token generated:", token); // Debug log
            res.status(201).json(token);
          }
        });
      }
    );
  } catch (err) {
    console.error("Error in createUser:", err); // Debug log
    res.status(400).json(err);
  }
}

export async function loginUser(req, res) {
  res.json(req.user);
}

export async function checkUser(req, res) {
  res.json({ status: "success", user: req.user });
}
