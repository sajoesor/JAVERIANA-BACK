import mongoose from 'mongoose';

const salonSchema = new mongoose.Schema({
  salón: String,
  edificio: String,
  piso: Number,
  capacidad: Number,
  puestos_contados: Number,
  tipo_de_Aula: String,
  tipo_de_mesa: String,
  tipo_de_silla: String,
  tipo_de_tablero: String,
  equipamiento_Tecnologico : String,
  tomacorriente: String,
  movilidad: String,
  entorno: String,
  imagen_s3: String 
});

export const Salon = mongoose.model('Salon', salonSchema);
