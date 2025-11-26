// backend/db/sequelize.js
const { Sequelize, DataTypes, Op } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Configuración dinámica de SSL: Solo activarlo si estamos en producción (Railway)
const dialectOptions = process.env.NODE_ENV === 'production' ? {
  ssl: {
      require: true,
      rejectUnauthorized: false
  }
} : {};

// 1. CONEXIÓN
const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: dialectOptions // Usamos la config dinámica
  }
);

// --- 2. DEFINICIÓN DE MODELOS ---

const User = sequelize.define('User', { 
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false } 
}, { freezeTableName: true });

const Routine = sequelize.define('Routine', { 
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  focus: DataTypes.STRING,
  duration: DataTypes.STRING, // <--- ¡FALTABA ESTO!
  isDefault: { type: DataTypes.BOOLEAN, defaultValue: false } 
}, { freezeTableName: true });

const Exercise = sequelize.define('Exercise', { 
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  sets: { type: DataTypes.INTEGER, allowNull: false },
  reps: { type: DataTypes.INTEGER, allowNull: false },
  weight: { type: DataTypes.FLOAT, defaultValue: 0 }, // <--- ¡FALTABA ESTO!
  day: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 } // <--- ¡FALTABA ESTO!
}, { freezeTableName: true });

// --- 3. RELACIONES ---
User.hasMany(Routine); 
Routine.belongsTo(User); 

// Importante: cascade delete para borrar ejercicios si se borra la rutina
Routine.hasMany(Exercise, { onDelete: 'CASCADE' }); 
Exercise.belongsTo(Routine);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos exitosa.');
        await sequelize.sync({ alter: true }); 
        console.log('✅ Modelos sincronizados (Columnas actualizadas).');
    } catch (error) {
        console.error('❌ Error conectando a la BD:', error);
    }
};

module.exports = { sequelize, User, Routine, Exercise, connectDB, Op };