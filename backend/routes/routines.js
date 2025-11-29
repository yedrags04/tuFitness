const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Routine, Exercise, Op } = require('../db/sequelize'); 

// ==========================================
// MIDDLEWARE DE SEGURIDAD (INTEGRADO)
// ==========================================
// Definimos la función aquí mismo para evitar problemas de importación
const auth = (req, res, next) => {
  // 1. Leer el token del header
  const token = req.header('x-auth-token');
  
  // 2. Si no hay token, denegar acceso
  if (!token) {
    return res.status(401).json({ msg: 'No hay token, permiso denegado' });
  }

  try {
    // 3. Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // 4. Guardar datos del usuario (IMPORTANTE: Así arreglamos el error de 'id' undefined)
    // Al hacer login firmaste: { id: user.id }, así que 'decoded' tiene la propiedad .id directa
    req.user = decoded; 
    
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token no es válido' });
  }
};

// ==========================================
// 1. OBTENER RUTINAS (GET)
// ==========================================
router.get('/', auth, async (req, res) => {
  try {
    const routines = await Routine.findAll({
      where: {
        [Op.or]: [
          { UserId: req.user.id }, // Mis rutinas (creadas por mi)
          { isDefault: true }      // Rutinas predeterminadas (públicas)
        ]
      },
      include: [{ model: Exercise }], // Traer ejercicios automáticamente
      order: [
        ['isDefault', 'DESC'], // Primero las predeterminadas
        ['id', 'DESC']         // Luego las más nuevas
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
  const { name, duration, exercises } = req.body;

  try {
    // Crear la rutina vinculada al usuario
    const newRoutine = await Routine.create({
      name,
      duration,
      UserId: req.user.id,
      isDefault: false // Las que crea el usuario NO son default
    });

    // Si hay ejercicios, crearlos y vincularlos
    if (exercises && exercises.length > 0) {
      const exercisesData = exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        day: ex.day || 1,
        RoutineId: newRoutine.id 
      }));
      await Exercise.bulkCreate(exercisesData);
    }

    // Devolver la rutina creada completa
    const result = await Routine.findByPk(newRoutine.id, { include: [Exercise] });
    res.json(result);

  } catch (err) {
    console.error("Error creando rutina:", err);
    res.status(500).send('Error al guardar la rutina');
  }
});

// ==========================================
// 3. EDITAR RUTINA (PUT)
// ==========================================
router.put('/:id', auth, async (req, res) => {
    const { name, duration, exercises } = req.body;
    const routineId = req.params.id;

    try {
        const routine = await Routine.findByPk(routineId);

        if (!routine) return res.status(404).json({ msg: 'Rutina no encontrada' });

        // PROTECCIÓN: No permitir editar rutinas públicas (default) ni de otros usuarios
        if (routine.isDefault) {
            return res.status(403).json({ msg: 'No puedes editar una rutina predeterminada. Crea una copia.' });
        }
        if (routine.UserId !== req.user.id) {
            return res.status(401).json({ msg: 'No tienes permiso para editar esta rutina.' });
        }

        // Actualizar datos básicos
        await routine.update({ name, duration });

        // Actualizar ejercicios (Estrategia: Borrar viejos -> Crear nuevos)
        await Exercise.destroy({ where: { RoutineId: routineId } });

        if (exercises && exercises.length > 0) {
            const exercisesData = exercises.map(ex => ({
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                weight: ex.weight,
                day: ex.day || 1,
                RoutineId: routineId
            }));
            await Exercise.bulkCreate(exercisesData);
        }

        res.json({ msg: 'Rutina actualizada correctamente' });

    } catch (err) {
        console.error("Error al actualizar:", err);
        res.status(500).send('Error del servidor');
    }
});

// ==========================================
// 4. BORRAR RUTINA (DELETE)
// ==========================================
router.delete('/:id', auth, async (req, res) => {
    try {
        const routine = await Routine.findByPk(req.params.id);
        
        if (!routine) return res.status(404).json({ msg: 'Rutina no encontrada' });

        // PROTECCIÓN
        if (routine.isDefault) {
            return res.status(403).json({ msg: "No puedes borrar una rutina predeterminada" });
        }
        if (routine.UserId !== req.user.id) {
            return res.status(403).json({ msg: "No tienes permiso para borrar esta rutina" });
        }

        await routine.destroy(); 
        res.status(200).json({ msg: "Rutina eliminada" });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

module.exports = router;