import express from 'express';
import {
  obtenerSalones,
  obtenerSalonPorId,
  responderPregunta
} from '../controllers/salonController.js';

export const salonRoutes = express.Router();

salonRoutes.get('/salones', obtenerSalones);
salonRoutes.get('/salones/:id', obtenerSalonPorId);
salonRoutes.post('/salones/preguntar', responderPregunta);
