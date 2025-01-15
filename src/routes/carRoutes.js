import express from "express";
import {
  getInventory,
  getInventoryCount,
  getAverageMsrp,
  getHistoryLog,
} from "../controllers/carController.js";

const router = express.Router();

router.get("/inventory", getInventory);
router.get("/inventory-count", getInventoryCount);
router.get("/average-msrp", getAverageMsrp);
router.get("/history-log", getHistoryLog);

export default router;
