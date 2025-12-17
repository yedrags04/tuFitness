// backend/seedRoutines.js
const { sequelize, Routine, Exercise, Set, connectDB } = require('./db/sequelize');

const seedData = async () => {
    await connectDB();

    try {
        console.log("🌱 Creando rutinas predeterminadas...");

        // 1. Rutina de Cuerpo Completo (Full Body)
        const fullBody = await Routine.create({
            nombre: "Full Body - Principiante",
            esPredeterminada: true, // CLAVE: Esto hace que salga en la sección de abajo
            duration: 60,
            UsuarioId: null // Las predeterminadas no tienen dueño (o puedes poner el ID de un admin)
        });

        // Ejercicios Día 1
        const ex1 = await Exercise.create({ nombre: "Sentadilla Copa", dia: "1", RutinaId: fullBody.id });
        await Set.bulkCreate([
            { repeticiones: 12, peso: 10, EjercicioId: ex1.id },
            { repeticiones: 12, peso: 10, EjercicioId: ex1.id },
            { repeticiones: 10, peso: 12, EjercicioId: ex1.id }
        ]);

        const ex2 = await Exercise.create({ nombre: "Flexiones", dia: "1", RutinaId: fullBody.id });
        await Set.bulkCreate([
            { repeticiones: 10, peso: 0, EjercicioId: ex2.id },
            { repeticiones: 8, peso: 0, EjercicioId: ex2.id }
        ]);

        // 2. Rutina Torso/Pierna (2 Días)
        const torsoPierna = await Routine.create({
            nombre: "Torso / Pierna - Intermedio",
            esPredeterminada: true,
            duration: 75,
            UsuarioId: null
        });

        // Día 1: Torso
        const pressBanca = await Exercise.create({ nombre: "Press Banca", dia: "1", RutinaId: torsoPierna.id });
        await Set.create({ repeticiones: 8, peso: 40, EjercicioId: pressBanca.id });
        
        const remo = await Exercise.create({ nombre: "Remo con Barra", dia: "1", RutinaId: torsoPierna.id });
        await Set.create({ repeticiones: 10, peso: 35, EjercicioId: remo.id });

        // Día 2: Pierna
        const sentadilla = await Exercise.create({ nombre: "Sentadilla Libre", dia: "2", RutinaId: torsoPierna.id });
        await Set.create({ repeticiones: 5, peso: 60, EjercicioId: sentadilla.id });

        console.log("✅ Rutinas predeterminadas creadas con éxito.");
    } catch (error) {
        console.error("❌ Error al crear semillas:", error);
    } finally {
        await sequelize.close();
    }
};

seedData();