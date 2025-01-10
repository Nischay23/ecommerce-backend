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

//middlewares
server.use(
  cors({
    exposedHeaders: ["X-Total-Count"],
  })
);
server.use(express.json());
server.use("/products", productsRouter);
server.use("/categories", categoriesRouter);
server.use("/brands", brandsRouter);
server.use("/users", usersRouter);
server.use("/auth", authRouter);
server.use("/cart", cartRouter);
server.use("/orders", ordersRouter);

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/ecommerce");
  console.log("database connected");
}

server.get("/", (req, res) => {
  res.json({ status: "success" });
});

server.post("/products", createProduct);

server.listen(8080, () => {
  console.log("server started");
});
