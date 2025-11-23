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
    // CLAVE PARA RAILWAY/RENDER: La mayoría de los servicios cloud usan SSL
    dialectOptions: {
        ssl: {
            rejectUnauthorized: true, 
        }
    }
  }
);

// --- 2. DEFINICIÓN DE MODELOS (Tablas) ---
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false }
}, { freezeTableName: true });

const Routine = sequelize.define('Routine', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  focus: DataTypes.STRING,
  isDefault: { type: DataTypes.BOOLEAN, defaultValue: false } // Para rutinas predeterminadas
}, { freezeTableName: true });

const Exercise = sequelize.define('Exercise', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  sets: { type: DataTypes.INTEGER, allowNull: false },
  reps: { type: DataTypes.INTEGER, allowNull: false }
}, { freezeTableName: true });

// --- 3. RELACIONES (Asociaciones) ---
User.hasMany(Routine); 
Routine.belongsTo(User); 
Routine.hasMany(Exercise); 
Exercise.belongsTo(Routine);

// Función para conectar y sincronizar las tablas
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la DB SQL exitosa.');
        await sequelize.sync(); // Crea las tablas si no existen
    } catch (error) {
        console.error('❌ Fallo al conectar o sincronizar con la DB SQL:', error);
    }
};

module.exports = { sequelize, User, Routine, Exercise, connectDB, Op };