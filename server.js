import express from 'express';
import cors from 'cors';
// server.js o index.js
import dotenv from 'dotenv';

import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import path from 'path';
import { router as chatRoutes } from './routes/chatRoutes.js';
import { autoCloseInactiveConversations } from './utils/autoCloseConversations.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();
console.log('API KEY:', process.env.OPENAI_API_KEY);


// Verificar configuración requerida
if (!process.env.OPENAI_API_KEY || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.warn('⚠️  ADVERTENCIA: Faltan variables de entorno requeridas');
  console.log('Asegúrate de configurar en tu .env:');
  console.log('OPENAI_API_KEY, EMAIL_USER, EMAIL_PASSWORD, MONGODB_URI');
}

// Configuración de correo
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-gpt-app';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado para almacenar conversaciones'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/chat', chatRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'Servidor funcionando',
    status: 'OpenAI conectado',
    email: process.env.EMAIL_USER ? 'Correo configurado' : 'Correo no configurado'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});

// Ejecutar cada minuto para cerrar conversaciones inactivas
setInterval(() => {
  autoCloseInactiveConversations().catch(console.error);
}, 60 * 1000);


export { transporter };