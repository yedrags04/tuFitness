// backend/db/sequelize.js
const { Sequelize, DataTypes, Op } = require('sequelize');
const dotenv = require('dotenv');
const sqlite3 = require('@libsql/sqlite3');

dotenv.config();

// --- FIX PARA WINDOWS Y TURSO ---
// Creamos un "intermediario" para engañar a Sequelize.
// Sequelize creerá que se conecta a ':memory:' (y no intentará crear carpetas raras),
// pero nosotros forzamos la conexión real a Turso por detrás.
const customDriver = {
    ...sqlite3,
    Database: function(filename, mode, callback) {
        // Aquí ocurre la magia: ignoramos ':memory:' y usamos tu URL real
        const realUrl = process.env.TURSO_CONNECTION_URL;
        return new sqlite3.Database(realUrl, mode, callback);
    }
};

console.log("🔄 Conectando a Turso (usando fix para Windows)...");

const sequelize = new Sequelize({
  dialect: 'sqlite',
  dialectModule: customDriver, // Usamos nuestro driver trucado
  storage: ':memory:',         // Valor falso para que Sequelize no se queje en Windows
  logging: false
});

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
  duration: DataTypes.STRING,
  isDefault: { type: DataTypes.BOOLEAN, defaultValue: false } 
}, { freezeTableName: true });

const Exercise = sequelize.define('Exercise', { 
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  sets: { type: DataTypes.INTEGER, allowNull: false },
  reps: { type: DataTypes.INTEGER, allowNull: false },
  weight: { type: DataTypes.FLOAT, defaultValue: 0 },
  day: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }
}, { freezeTableName: true });

// --- 3. RELACIONES ---
User.hasMany(Routine); 
Routine.belongsTo(User); 
Routine.hasMany(Exercise, { onDelete: 'CASCADE' }); 
Exercise.belongsTo(Routine);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a Turso exitosa (Nube).');
        await sequelize.sync({ alter: true }); 
        console.log('✅ Modelos sincronizados.');
    } catch (error) {
        console.error('❌ Error conectando a la BD:', error);
    }
};

module.exports = { sequelize, User, Routine, Exercise, connectDB, Op };