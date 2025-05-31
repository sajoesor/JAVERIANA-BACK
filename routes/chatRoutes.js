// routes/chatRoutes.js
import express from 'express';
import { generateChatResponse, getConversationHistory } from '../controllers/chatController.js';

const router = express.Router();

router.post('/', generateChatResponse);           // Chat principal con JOFRAN
router.get('/history', getConversationHistory);   // Historial (opcional)

export { router };
