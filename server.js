import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { salonRoutes } from './routes/salonRoutes.js';
import { router as chatRoutes } from './routes/chatRoutes.js'; // Aquí están tus rutas para guardar conversaciones

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

// Verificar configuración de OpenAI
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  ADVERTENCIA: No se encontró la variable OPENAI_API_KEY');
  console.log('Crea un archivo .env con la línea: OPENAI_API_KEY=tu-api-key');
}

// MongoDB SOLO PARA CHAT
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-gpt-app';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado para almacenar conversaciones'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', salonRoutes);         // Salones (cargados desde JSON)
app.use('/api/chat', chatRoutes);     // Chat con GPT y Mongo

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'Servidor funcionando',
    status: 'OpenAI conectado',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
