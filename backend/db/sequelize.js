

const { Sequelize, DataTypes, Op } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();


console.log("🚀 Conectando a MySQL Local...");

const sequelize = new Sequelize(
    process.env.DB_NAME,       
    process.env.DB_USER,      
    process.env.DB_PASSWORD,   
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql', 
        dialectModule: require('mysql2'), 
        logging: false,
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
        type: DataTypes.BOOLEAN, 
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
    },
    duration: { 
        type: DataTypes.INTEGER, 
        defaultValue: false 
    } 
}, { freezeTableName: true, tableName: 'Rutina' });



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
        defaultValue: '1' 
    }
}, { freezeTableName: true, tableName: 'Ejercicio' });



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
        type: DataTypes.FLOAT, 
        defaultValue: 0 
    }
}, { freezeTableName: true, tableName: 'Set', timestamps: false });



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
        
        
        await sequelize.sync({ force: false, alter: true }); 

        console.log('✅ Tablas sincronizadas correctamente.');
    } catch (error) {
        
        console.error('❌ Error crítico: Falló la conexión o la sincronización con MySQL.');
        console.error('Detalles:', error.message);
    }
};

module.exports = { sequelize, User, Routine, Exercise, Set, connectDB, Op };