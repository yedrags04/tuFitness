// backend/db/sequelize.js
const { Sequelize, DataTypes, Op } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// 1. CONEXIÓN A MySQL (Compatible con Railway)
const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 42311, // Railway suele usar puertos aleatorios
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
        // Configuración SSL necesaria para la nube (Railway)
        ssl: {
            require: true,
            rejectUnauthorized: false // Importante para evitar errores de certificados autofirmados en desarrollo
        }
    }
  }
);

// --- 2. DEFINICIÓN DE MODELOS ---

// AQUI ESTABA EL ERROR: Definimos las columnas reales para el Usuario
const User = sequelize.define('User', { 
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false } // Aquí se guardará el hash
}, { freezeTableName: true });

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
        console.log('✅ Conexión a Railway MySQL exitosa.');
        // alter: true ajusta las tablas si cambias columnas sin borrar datos
        await sequelize.sync({ alter: true }); 
        console.log('✅ Modelos sincronizados.');
    } catch (error) {
        console.error('❌ Error conectando a Railway:', error);
    }
};

module.exports = { sequelize, User, Routine, Exercise, connectDB, Op };