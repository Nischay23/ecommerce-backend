import express from "express";
import {
  createOrder,
  updateOrder,
  fetchOrdersByUser,
  deleteOrder,
} from "../controller/Order.js";

const router = express.Router();
//  /orders is already added in base path
router
  .post("/", createOrder)
  .get("/", fetchOrdersByUser)
  .delete("/:id", deleteOrder)
  .patch("/:id", updateOrder);

export default router;
