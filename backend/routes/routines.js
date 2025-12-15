const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Routine, Exercise, Set, Op } = require('../db/sequelize');

// ==========================================
// MIDDLEWARE DE SEGURIDAD (INTEGRADO)
// ==========================================
const auth = (req, res, next) => {
    let token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        token = req.header('x-auth-token');
    }

    if (!token) {
        return res.status(401).json({ msg: 'No hay token, permiso denegado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded; 
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token no es válido' });
    }
};

// backend/routes/routines.js (CORREGIDO)

// ... (código auth middleware - sin cambios) ...

// ==========================================
// 1. OBTENER RUTINAS (GET)
// ==========================================
router.get('/', auth, async (req, res) => {
  try {
    const routines = await Routine.findAll({
      where: {
        [Op.or]: [
          // 🔑 CLAVE 1: Corregido a 'UsuarioId'
          { UsuarioId: req.user.id }, 
          // 🔑 CLAVE 2: Corregido a 'esPredeterminada'
          { esPredeterminada: true }      
        ]
      },
      // Incluir Exercises con alias 'Exercises'
      include: [{ 
        model: Exercise, 
        as: 'Exercises',
        // 🛑 CLAVE 1: Incluir la relación Set (Serie) dentro de Exercise
        include: [{ model: Set, as: 'Sets' }] 
      }], 
      order: [
        ['esPredeterminada', 'DESC'], // Usar el nombre de columna REAL
        ['id', 'DESC']         
      ]
    });
    res.json(routines);
  } catch (err) {
    console.error("Error GET /routines:", err);
    res.status(500).send('Error del servidor al obtener rutinas');
  }
});

// ==========================================
// 2. CREAR RUTINA (POST)
// ==========================================
router.post('/', auth, async (req, res) => {
    // 🔑 CLAVE 3: Mapear 'name' del frontend a 'nombre' del modelo.
    // 🔑 CLAVE 4: Mapear 'duration' a 'duration' (si existe) y 'exercises'
    // Asumimos que el frontend envía { name, duration, exercises, isDefault }
    const { name, duration, exercises, isDefault } = req.body; 

    try {
        // 1. Validación (para capturar el error de 'nombre cannot be null')
        if (!name || name.trim() === '') {
            return res.status(400).json({ msg: "El campo 'nombre' es obligatorio." });
        }

        // 2. Crear la rutina vinculada al usuario
        const newRoutine = await Routine.create({
            nombre: name, // 🔑 CLAVE: Usamos 'name' del req.body para la columna 'nombre'
            // Si 'duration' existe en el modelo, úsalo aquí. (No lo definiste, lo quito)
            // isDefault se mapea a esPredeterminada
            esPredeterminada: isDefault || false, 
            UsuarioId: req.user.id // 🔑 CLAVE: Usar la FK correcta
        });

        // ... Lógica de creación de ejercicios/sets (Corregir nombres de FK aquí también)
        if (exercises && exercises.length > 0) {
            for (const ex of exercises) {
                // 2.1. Crear el Ejercicio
                const newExercise = await Exercise.create({
                    nombre: ex.name, // Mapeo: 'name' (frontend) -> 'nombre' (BD)
                    day: ex.day || 'Dia 1', 
                    RutinaId: newRoutine.id 
                });

                // 2.2. Crear las Series (Sets) para este Ejercicio
                if (ex.series && ex.series.length > 0) {
                    const setsData = ex.series.map(serie => ({
                        // Mapeo: 'reps' (frontend) -> 'repeticiones' (BD)
                        repeticiones: parseInt(serie.reps) || 0,
                        // Mapeo: 'weight' (frontend) -> 'peso' (BD)
                        peso: parseFloat(serie.weight) || 0,
                        EjercicioId: newExercise.id 
                    }));
                    await Set.bulkCreate(setsData);
                }
            }
        }
        // ... (el resto del POST)
        const result = await Routine.findByPk(newRoutine.id, { 
            include: [{ 
                model: Exercise, 
                as: 'Exercises',
                include: [{ model: Set, as: 'Sets' }] // 🛑 CLAVE 3
            }] 
        });
        res.status(201).json(result);
    } catch (err) {
        console.error("Error creando rutina:", err);
        res.status(500).send('Error al guardar la rutina');
    }
});

// ==========================================
// 3. EDITAR RUTINA (PUT)
// ==========================================
router.put('/:id', auth, async (req, res) => {
    // 🔑 CLAVE: Extraer 'nombre' y 'esPredeterminada'
    const { name, duration, isDefault, exercises } = req.body;
    const routineId = req.params.id;

    try {
        const routine = await Routine.findByPk(routineId);
        // ...

        // PROTECCIÓN
        if (routine.esPredeterminada) { // Usar el nombre de columna REAL
            // ...
        }
        if (routine.UsuarioId !== req.user.id) { // 🔑 CLAVE: Usar la FK correcta
            // ...
        }

        await routine.update({ 
            nombre: name, // 🔑 CLAVE: Mapear 'name' del frontend a 'nombre' de la BD
            // Si 'duration' es un campo de tu modelo Routine, añádelo aquí
            // Si no es un campo de tu modelo Routine, bórralo
            duration: duration 
            // Si también permites cambiar esPredeterminada, añádelo: esPredeterminada: isDefault || false
        });

        await Exercise.destroy({ where: { RutinaId: routineId } }); 
        
        // 🛑 CLAVE 4: Recrear Ejercicios Y Sus Series (Misma lógica del POST)
        if (exercises && exercises.length > 0) {
            for (const ex of exercises) {
                const newExercise = await Exercise.create({
                    nombre: ex.name, 
                    day: ex.day || 'Dia 1', 
                    RutinaId: routineId 
                });
                if (ex.series && ex.series.length > 0) {
                    const setsData = ex.series.map(serie => ({
                        repeticiones: parseInt(serie.reps) || 0,
                        peso: parseFloat(serie.weight) || 0,
                        EjercicioId: newExercise.id
                    }));
                    await Set.bulkCreate(setsData);
                }
            }
        }
        
        res.status(200).json({ msg: "Rutina actualizada correctamente." });
    } catch (err) { 
        console.error("Error PUT /routines:", err);
        res.status(500).send('Error del servidor al editar rutina');
    }
});

// ==========================================
// 4. BORRAR RUTINA (DELETE)
// ==========================================
router.delete('/:id', auth, async (req, res) => {
    try {
        const routine = await Routine.findByPk(req.params.id);
        // ...
        
        // PROTECCIÓN
        if (routine.esPredeterminada) { /* ... */ }
        // 🔑 CLAVE: Usar la FK correcta
        if (routine.UsuarioId !== req.user.id) { /* ... */ }

        await routine.destroy(); 
        res.status(200).json({ msg: "Rutina eliminada" });
    } catch (err) { /* ... */ }
});

module.exports = router;