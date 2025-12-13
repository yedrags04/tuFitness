// backend/db/sequelize.js

const { Sequelize, DataTypes, Op } = require('sequelize');
const dotenv = require('dotenv');
// Ya NO se requiere: const sqlite3 = require('@libsql/sqlite3');
// Ya NO se requiere: el parche de customDriver

dotenv.config();

// --- 1. CONFIGURACIÓN DE CONEXIÓN A MYSQL ---

console.log("🚀 Conectando a MySQL Local...");

const sequelize = new Sequelize(
    process.env.DB_NAME,       // Nombre de la BD (requiere .env actualizado)
    process.env.DB_USER,       // Usuario
    process.env.DB_PASSWORD,   // Contraseña
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql', // <-- CAMBIO CLAVE: Usar dialecto MySQL
        dialectModule: require('mysql2'), // <-- Usar el paquete que instalaste
        logging: false, // Puedes cambiar a console.log para debugging SQL
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci'
        }
    }
);

// --- 2. MODELOS (Se mantienen intactos, solo cambian los tipos nativos que MySQL maneja) ---

// Modelo User (Usuario)
const User = sequelize.define('User', { 
    id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    username: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: true 
    },
    email: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: true, 
        validate: { isEmail: true } 
    },
    genero: { 
        type: DataTypes.BOOLEAN, // MySQL lo manejará como TINYINT(1)
        allowNull: true 
    },
    anioNacimiento: { 
        type: DataTypes.INTEGER, 
        allowNull: true 
    },
    estatura: { 
        type: DataTypes.DOUBLE, 
        allowNull: true 
    },
    peso: { 
        type: DataTypes.DOUBLE, 
        allowNull: true 
    },
    contrasena: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        validate: { len: [6, 255] } 
    } 
}, { freezeTableName: true, tableName: 'Usuario' });


// Modelo Routine (Rutina)
const Routine = sequelize.define('Routine', { 
    id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    nombre: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    esPredeterminada: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false 
    } 
}, { freezeTableName: true, tableName: 'Rutina' });


// Modelo Exercise (Ejercicio)
const Exercise = sequelize.define('Exercise', { 
    id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    nombre: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    dia: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        defaultValue: 'Lunes' 
    }
}, { freezeTableName: true, tableName: 'Ejercicio' });


// Modelo Set (Serie)
const Set = sequelize.define('Set', {
    id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    repeticiones: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        defaultValue: 0 
    },
    peso: { 
        type: DataTypes.FLOAT, // Usamos FLOAT para mayor precisión que DOUBLE si no es necesario
        defaultValue: 0 
    }
}, { freezeTableName: true, tableName: 'Set', timestamps: false });


// --- 3. RELACIONES (Se mantienen correctas) ---
User.hasMany(Routine, { foreignKey: 'UsuarioId' }); 
Routine.belongsTo(User, { foreignKey: 'UsuarioId' }); 

Routine.hasMany(Exercise, { onDelete: 'CASCADE', foreignKey: 'RutinaId' }); 
Exercise.belongsTo(Routine, { foreignKey: 'RutinaId' });

Exercise.hasMany(Set, { onDelete: 'CASCADE', foreignKey: 'EjercicioId' }); 
Set.belongsTo(Exercise, { foreignKey: 'EjercicioId' });


const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a MySQL establecida.');
        
        // Ya no necesitamos las consultas PRAGMA ni las limpiezas de tablas backup
        // MySQL es más estable con { force: false, alter: true }
        await sequelize.sync({ force: false, alter: true }); 

        console.log('✅ Tablas sincronizadas correctamente.');
    } catch (error) {
        // En MySQL, los errores de conexión se verán como "Access denied" o "Unknown database"
        console.error('❌ Error crítico: Falló la conexión o la sincronización con MySQL.');
        console.error('Detalles:', error.message);
    }
};

module.exports = { sequelize, User, Routine, Exercise, Set, connectDB, Op };