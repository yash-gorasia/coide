import express from 'express';
import { chatWithCode } from '../controllers/chatbotController.js';

const router = express.Router();

// POST /api/chatbot - Send a message to the chatbot with code context
router.post('/', chatWithCode);

export default router;
