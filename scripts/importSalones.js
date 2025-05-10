import mongoose from 'mongoose';
import dotenv from 'dotenv';
import xlsx from 'xlsx';
import { Salon } from '../models/salon.js';

dotenv.config();

const workbook = xlsx.readFile('./Planta Fisica - Revisión.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet, { range: 1 });

const salones = data.map(row => ({
  salon: row['Salón'],
  edificio: row['EDIFICIO'],
  piso: row['PISO'],
  capacidad: row['CAPACIDAD'],
  puestos_contados: row['REVISIÓN RA - DICIEMBRE 2024 - ABRIL 2025'],
  descripcion: `El salón ${row['Salón']} está ubicado en el edificio ${row['EDIFICIO']}, piso ${row['PISO']}. Tiene una capacidad de ${row['CAPACIDAD']} personas y se contaron ${row['REVISIÓN RA - DICIEMBRE 2024 - ABRIL 2025']} puestos. Es un aula de tipo ${row['Tipo de Aula']} con mesas ${row['Tipo de mesa']}, sillas ${row['Tipo de silla']} y tablero ${row['Tipo de tablero']}. Está equipado con ${row['Equipamiento Tecnológico']}, tomacorrientes '${row['Tomacorriente']}', movilidad '${row['Movilidad']}', y el entorno es '${row['Entorno']}'. ¿Foto disponible? ${row['Foto']}.`
}));

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await Salon.deleteMany();
    await Salon.insertMany(salones);
    console.log('✅ Datos importados con éxito');
    process.exit();
  })
  .catch(err => {
    console.error('❌ Error al importar:', err);
    process.exit(1);
  });
