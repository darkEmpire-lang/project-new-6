import express from "express";
import { getDeliveryInfos, addDeliveryInfo, updateDeliveryInfo, deleteDeliveryInfo, } from "../controllers/deliveryController.js";
import authUser from "../middleware/auth.js";

const router = express.Router();

router.get("/", authUser, getDeliveryInfos);
router.post("/", authUser, addDeliveryInfo);
router.put("/:id", authUser, updateDeliveryInfo);
router.delete("/:id", authUser, deleteDeliveryInfo);

export default router;
