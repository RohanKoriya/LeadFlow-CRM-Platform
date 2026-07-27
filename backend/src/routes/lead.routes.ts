import express from "express";

import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
} from "../controllers/lead.controller";

import { protect } from "../middleware/auth.middleware";

import { authorizeRoles } from "../middleware/role.middleware";
import { validateLead } from "../middleware/validate.middleware";
import { upload } from "../middleware/upload.middleware";
import { importLeads } from "../controllers/lead.controller";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("admin", "sales"),
  validateLead,
  createLead,
);

router.get("/", protect, authorizeRoles("admin", "sales"), getLeads);

router.post(
  "/import",
  protect,
  authorizeRoles("admin"),
  upload.single("file"),
  importLeads,
);

router.get("/:id", protect, authorizeRoles("admin", "sales"), getLeadById);

router.put("/:id", protect, authorizeRoles("admin", "sales"), updateLead);

router.delete("/:id", protect, authorizeRoles("admin"), deleteLead);

export default router;
