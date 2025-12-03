// backend/db/sequelize.js
const { Sequelize, DataTypes, Op } = require('sequelize');
const dotenv = require('dotenv');
const sqlite3 = require('@libsql/sqlite3');

dotenv.config();

// --- PARCHE "NUCLEAR" PARA TURSO + SEQUELIZE ---
// Función helper para descongelar objetos de forma agresiva
const deepUnfreeze = (data) => {
    if (!data) return data;
    try {
        // Copia profunda usando JSON.parse/stringify para eliminar cualquier referencia de solo lectura
        return JSON.parse(JSON.stringify(data));
    } catch (e) {
        return data; // Fallback por si acaso
    }
};

// Creamos un driver personalizado que envuelve al original
const customDriver = {
    ...sqlite3,
    Database: function(filename, mode, callback) {
        // Forzamos la conexión real a la URL de Turso
        const realUrl = process.env.TURSO_CONNECTION_URL;
        const db = new sqlite3.Database(realUrl, mode, callback);

        // 1. Interceptamos db.all (Consultas directas)
        const originalDbAll = db.all;
        db.all = function(sql, ...args) {
            const lastArg = args[args.length - 1];
            if (typeof lastArg === 'function') {
                const originalCallback = lastArg;
                // Reemplazamos el callback original
                args[args.length - 1] = (err, rows) => {
                    if (rows) rows = deepUnfreeze(rows); // <--- DESCONGELAR
                    originalCallback(err, rows);
                };
            }
            return originalDbAll.apply(this, [sql, ...args]);
        };

        // 2. Interceptamos db.get (Consultas de una fila)
        const originalDbGet = db.get;
        db.get = function(sql, ...args) {
            const lastArg = args[args.length - 1];
            if (typeof lastArg === 'function') {
                const originalCallback = lastArg;
                args[args.length - 1] = (err, row) => {
                    if (row) row = deepUnfreeze(row); // <--- DESCONGELAR
                    originalCallback(err, row);
                };
            }
            return originalDbGet.apply(this, [sql, ...args]);
        };

        // 3. Interceptamos db.prepare (Sentencias preparadas)
        const originalPrepare = db.prepare;
        db.prepare = function(sql, ...args) {
            const stmt = originalPrepare.apply(this, [sql, ...args]);

            // 3a. Interceptamos stmt.all
            const originalStmtAll = stmt.all;
            stmt.all = function(...sArgs) {
                const lastArg = sArgs[sArgs.length - 1];
                if (typeof lastArg === 'function') {
                    const cb = lastArg;
                    sArgs[sArgs.length - 1] = (err, rows) => {
                        if (rows) rows = deepUnfreeze(rows); // <--- DESCONGELAR
                        cb(err, rows);
                    };
                }
                return originalStmtAll.apply(this, sArgs);
            };

            // 3b. Interceptamos stmt.get
            const originalStmtGet = stmt.get;
            stmt.get = function(...sArgs) {
                const lastArg = sArgs[sArgs.length - 1];
                if (typeof lastArg === 'function') {
                    const cb = lastArg;
                    sArgs[sArgs.length - 1] = (err, row) => {
                        if (row) row = deepUnfreeze(row); // <--- DESCONGELAR
                        cb(err, row);
                    };
                }
                return originalStmtGet.apply(this, sArgs);
            };

            return stmt;
        };

        return db;
    }
};

console.log("🚀 Conectando a Turso (Modo: Parche Completo)...");

const sequelize = new Sequelize({
  dialect: 'sqlite',
  dialectModule: customDriver, 
  storage: ':memory:', // Dummy para Windows
  logging: false,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

// --- MODELOS ---
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

// --- RELACIONES ---
User.hasMany(Routine); 
Routine.belongsTo(User); 
Routine.hasMany(Exercise, { onDelete: 'CASCADE' }); 
Exercise.belongsTo(Routine);

// En backend/db/sequelize.js

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a Turso establecida.');
        
        // 1. Desactivar claves foráneas para poder tocar las tablas sin errores
        await sequelize.query('PRAGMA foreign_keys = OFF;');

        // 2. LIMPIEZA PREVENTIVA: Borrar cualquier tabla backup que se haya quedado "colgada"
        // Esto es lo que arregla tu error actual y futuros
        await sequelize.query('DROP TABLE IF EXISTS `User_backup`;');
        await sequelize.query('DROP TABLE IF EXISTS `Routine_backup`;');
        await sequelize.query('DROP TABLE IF EXISTS `Exercise_backup`;');

        // 3. Sincronizar (alter: true intentará ajustar las tablas sin borrar datos)
        await sequelize.sync({ force: false }); 

        // 4. Reactivar claves foráneas
        await sequelize.query('PRAGMA foreign_keys = ON;');

        console.log('✅ Tablas sincronizadas correctamente.');
    } catch (error) {
        console.error('❌ Error crítico en la conexión:', error);
    }
};

module.exports = { sequelize, User, Routine, Exercise, connectDB, Op };