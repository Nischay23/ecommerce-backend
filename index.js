import express from "express";
const server = express();
import mongoose from "mongoose";

import { createProduct } from "./controller/Product.js";
import productsRouter from "./routes/Products.js";
import categoriesRouter from "./routes/Categories.js";
import brandsRouter from "./routes/Brands.js";
import usersRouter from "./routes/User.js";
import authRouter from "./routes/Auth.js";
import cartRouter from "./routes/Cart.js";
import ordersRouter from "./routes/Order.js";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Strategy as JwtStrategy } from "passport-jwt";
import { ExtractJwt as ExtractJwt } from "passport-jwt";

import { User } from "./model/User.js";
import { isAuth, sanitizeUser, cookieExtractor } from "./services/common.js";
import cookieParser from "cookie-parser";

const SECRET_KEY = "SECRET_KEY";
// JWT options
const opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = SECRET_KEY; // TODO: should not be in code;

//middlewares

server.use(express.static("build"));
server.use(cookieParser());
server.use(express.json()); // Middleware to parse JSON requests

server.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);
server.use(passport.initialize());
server.use(passport.session()); // Handles persistent login sessions

server.use(
  cors({
    exposedHeaders: ["X-Total-Count"],
  })
);

server.use("/products", isAuth(), productsRouter);
// we can also use JWT token for client-only auth
server.use("/categories", isAuth(), categoriesRouter);
server.use("/brands", isAuth(), brandsRouter);
server.use("/users", isAuth(), usersRouter);
server.use("/auth", authRouter);
server.use("/cart", isAuth(), cartRouter);
server.use("/orders", isAuth(), ordersRouter);
// Passport Strategies
passport.use(
  "local",
  new LocalStrategy({ usernameField: "email" }, async function (
    email,
    password,
    done
  ) {
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        return done(null, false, { message: "invalid credentials" });
      }
      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        "sha256",
        async function (err, hashedPassword) {
          if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
            return done(null, false, { message: "Invalid credentials" });
          }

          // Generate token
          const token = jwt.sign({ user }, SECRET_KEY);
          console.log("Generated Token:", token); // Debug token generation
          done(null, { id: user.id, role: user.role });
        }
      );
    } catch (err) {
      done(err);
    }
  })
);

passport.use(
  "jwt",
  new JwtStrategy(opts, async function (jwt_payload, done) {
    console.log("Decoded JWT Payload in JwtStrategy:", jwt_payload);

    if (!jwt_payload.id) {
      console.error("JWT Payload missing id");
      return done(null, false, { message: "Invalid JWT payload" });
    }

    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        console.log("User found:", user);
        return done(null, user);
      } else {
        console.error("User not found in database");
        return done(null, false);
      }
    } catch (err) {
      console.error("Error in JwtStrategy:", err);
      return done(err, false);
    }
  })
);

// this creates session variable req.user on being called from callbacks
passport.serializeUser(function (user, cb) {
  console.log("serialize", user);
  process.nextTick(function () {
    return cb(null, { id: user.id, role: user.role });
  });
});

passport.deserializeUser(function (user, cb) {
  console.log("de-serialize", user);
  process.nextTick(function () {
    return cb(null, user);
  });
});
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/ecommerce");
  console.log("database connected");
}

server.listen(8080, () => {
  console.log("server started");
});
