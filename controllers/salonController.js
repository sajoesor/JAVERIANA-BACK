import dotenv from 'dotenv';
dotenv.config(); // 👉 Esto DEBE ir antes de usar process.env

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

// Inicializar cliente OpenAI después de cargar .env
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Leer JSON desde archivo local
const salonesPath = path.resolve('./data/salones.json');
let salonesData = [];

function limpiarCampos(obj) {
  const limpio = {};
  for (let key in obj) {
    const nuevaClave = key.trim().toLowerCase().replace(/\s+/g, '_');
    limpio[nuevaClave] = obj[key];
  }
  return limpio;
}


try {
  const fileContent = fs.readFileSync(salonesPath, 'utf-8');
  salonesData = JSON.parse(fileContent).map(limpiarCampos);
} catch (error) {
  console.error('❌ Error leyendo el archivo JSON de salones:', error);
}

// Obtener todos los salones
export const obtenerSalones = (req, res) => {
  res.json(salonesData);
};

// Obtener un salón por su ID (nombre)
export const obtenerSalonPorId = (req, res) => {
  const { id } = req.params;
  const salon = salonesData.find(s => s.salón === id);
  if (!salon) return res.status(404).json({ error: 'Salón no encontrado' });
  res.json(salon);
};

// Responder preguntas usando OpenAI
export const responderPregunta = async (req, res) => {
  const { pregunta } = req.body;

  const contexto = salonesData.map(s => 
    `Salón: ${s.salón}, 
     Capacidad: ${s.capacidad}, 
     Piso: ${s.piso}, 
     Edificio: ${s.edificio}, 
     Equipamiento: ${s.equipamiento_tecnológico || "N/A"}`,
  ).join('\n');
  
  
console.log("Contexto generado para OpenAI:", contexto);


  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Eres un asistente experto en información de salones universitarios. Responde usando solo los datos proporcionados." },
        { role: "user", content: `Información:\n${contexto}\n\nPregunta:\n${pregunta}` }
      ]
    });

    const respuesta = completion.choices[0].message.content;
    res.json({ respuesta });
  } catch (err) {
    console.error('❌ Error al generar respuesta:', err);
    res.status(500).json({ error: 'Error al generar respuesta' });
  }
};
