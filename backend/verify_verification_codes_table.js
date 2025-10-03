// Script para verificar la estructura de la tabla verification_codes y agregar columnas si faltan
require('dotenv').config();
const { db } = require('./src/config/db');

async function checkAndAlterTable() {
  try {
    // Verificar columnas existentes
    const [columns] = await db.query("SHOW COLUMNS FROM verification_codes");
    const colNames = columns.map(col => col.Field);
    const alters = [];
    if (!colNames.includes('email')) {
      alters.push('ADD COLUMN email VARCHAR(255) NOT NULL');
    }
    if (!colNames.includes('username')) {
      alters.push('ADD COLUMN username VARCHAR(255) NOT NULL');
    }
    if (!colNames.includes('password')) {
      alters.push('ADD COLUMN password VARCHAR(255) NOT NULL');
    }
    if (alters.length > 0) {
      const alterSQL = `ALTER TABLE verification_codes ${alters.join(', ')};`;
      await db.query(alterSQL);
      console.log('Tabla verification_codes actualizada:', alterSQL);
    } else {
      console.log('La tabla verification_codes ya tiene todas las columnas necesarias.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error verificando/alterando la tabla:', err);
    process.exit(1);
  }
}

checkAndAlterTable();
