import mongoose from 'mongoose';

const salonSchema = new mongoose.Schema({
  Salón: String,
  edificio: String,
  piso: Number,
  capacidad: Number,
  puestos_contados: Number,
  Tipo_de_Aula: String,
  Tipo_de_mesa: String,
  Tipo_de_silla: String,
  Tipo_de_tablero: String,
  Equipamiento_Tecnologico : String,
  Tomacorriente: String,
  Movilidad: String,
  entorno: String,
  imagen_s3: String 
});

export const Salon = mongoose.model('Salon', salonSchema);
