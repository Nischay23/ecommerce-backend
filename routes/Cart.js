import express from "express";
import {
  fetchCartByUser,
  addToCart,
  updateCart,
  deleteFromCart,
} from "../controller/Cart.js";
const router = express.Router();
//  /products is already added in base path
router
  .post("/", addToCart)
  .get("/", fetchCartByUser)
  .delete("/:id", deleteFromCart)
  .patch("/:id", updateCart);

export default router;
