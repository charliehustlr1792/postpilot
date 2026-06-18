import express, { Router } from "express";
import { handleClerkWebhook } from "../controllers/webhookController";

const router = Router();

// Raw body parser is required so svix can verify the exact payload bytes.
// This route must be mounted BEFORE the global express.json() middleware.
router.post(
    "/webhooks/clerk",
    express.raw({ type: "application/json" }),
    handleClerkWebhook
);

export default router;
