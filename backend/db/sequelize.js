// backend/db/sequelize.js
const { Sequelize, DataTypes, Op } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// 1. CONEXIÓN A MySQL usando las variables de entorno
const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    // ESTE BLOQUE SSL ES CRUCIAL PARA LA CONEXIÓN EN RAILWAY
    dialectOptions: {
        ssl: {
            rejectUnauthorized: true, 
        }
    }
  }
);

// --- 2. DEFINICIÓN DE MODELOS (Tablas) ---
const User = sequelize.define('User', { /* ... Definición de columnas ... */ }, { freezeTableName: true });
const Routine = sequelize.define('Routine', { 
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  focus: DataTypes.STRING,
  isDefault: { type: DataTypes.BOOLEAN, defaultValue: false } 
}, { freezeTableName: true });

const Exercise = sequelize.define('Exercise', { 
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  sets: { type: DataTypes.INTEGER, allowNull: false },
  reps: { type: DataTypes.INTEGER, allowNull: false }
}, { freezeTableName: true });

// --- 3. RELACIONES ---
User.hasMany(Routine); 
Routine.belongsTo(User); 
Routine.hasMany(Exercise); 
Exercise.belongsTo(Routine);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la DB SQL exitosa.');
        await sequelize.sync(); // Sincroniza y crea/actualiza las tablas en la DB
    } catch (error) {
        console.error('❌ Fallo al conectar o sincronizar con la DB SQL:', error);
    }
};

module.exports = { sequelize, User, Routine, Exercise, connectDB, Op };