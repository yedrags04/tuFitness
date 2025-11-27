// backend/routes/routines.js
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Routine, Exercise, Op } = require('../db/sequelize'); 
const auth = require('../routes/auth');

// Middleware para verificar token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['x-auth-token'] || req.headers.token; // Aceptamos ambos nombres por si acaso
  if (authHeader) {
    // Si viene con "Bearer token" o solo "token", intentamos limpiar
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json("Token inválido");
      req.user = user; 
      next();
    });
  } else {
    return res.status(401).json("No estás autenticado");
  }
};

// @route   GET api/routines
router.get('/', verifyToken, async (req, res) => {
  try {
    const routines = await Routine.findAll({
      where: {
        [Op.or]: [
          { UserId: req.user.id },
          { isDefault: true }
        ]
      },
      include: [Exercise], // Incluir los ejercicios al pedir las rutinas
      order: [['id', 'DESC']]
    });
    res.status(200).json(routines);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
});

// @route   POST api/routines  <--- ESTA ERA LA QUE FALTABA
// @desc    Crear nueva rutina
router.post('/', verifyToken, async (req, res) => {
    const { name, duration, exercises } = req.body;

    try {
        // 1. Crear la Rutina Padre
        const newRoutine = await Routine.create({
            name,
            duration,
            UserId: req.user.id,
            isDefault: false
        });

        // 2. Si hay ejercicios, añadirlos vinculándolos a la rutina creada
        if (exercises && exercises.length > 0) {
            const exercisesWithId = exercises.map(ex => ({
                ...ex,
                RoutineId: newRoutine.id // Vinculamos con la ID de la rutina recién creada
            }));
            await Exercise.bulkCreate(exercisesWithId);
        }

        res.status(201).json(newRoutine);
    } catch (err) {
        console.error("Error creando rutina:", err);
        res.status(500).json("Error al guardar la rutina");
    }
});

// @route   DELETE api/routines/:id
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const routine = await Routine.findOne({ where: { id: req.params.id } });
        if (!routine) return res.status(404).json("Rutina no encontrada");

        if (routine.UserId !== req.user.id) {
            return res.status(403).json("No tienes permiso");
        }

        await routine.destroy();
        res.status(200).json("Rutina eliminada");
    } catch (err) {
        res.status(500).json(err);
    }
});

// Ejemplo de ruta backend (Node/Express)
router.put('/:id', auth, async (req, res) => {
    const { name, duration, exercises } = req.body;
    const routineId = req.params.id;
    const userId = req.user.id; // Viene del token (auth)

    // Validación básica
    if (!name) {
        return res.status(400).json({ msg: 'Por favor incluye el nombre de la rutina' });
    }

    try {
        // 1. Verificar que la rutina existe y pertenece al usuario
        // (Ajusta 'client' o 'db' según cómo llames a tu conexión de Turso)
        const check = await client.execute({
            sql: "SELECT * FROM routines WHERE id = ? AND user_id = ?",
            args: [routineId, userId]
        });

        if (check.rows.length === 0) {
            return res.status(404).json({ msg: 'Rutina no encontrada o no autorizado' });
        }

        // 2. Actualizar los datos básicos de la rutina
        await client.execute({
            sql: "UPDATE routines SET name = ?, duration = ? WHERE id = ?",
            args: [name, duration, routineId]
        });

        // 3. Actualizar los ejercicios
        // ESTRATEGIA: Borrar los viejos y crear los nuevos (es más limpio que actualizar uno por uno)
        
        // A) Borrar ejercicios antiguos de esta rutina
        await client.execute({
            sql: "DELETE FROM exercises WHERE routine_id = ?",
            args: [routineId]
        });

        // B) Insertar los nuevos ejercicios (si hay)
        if (exercises && exercises.length > 0) {
            for (const ex of exercises) {
                await client.execute({
                    sql: "INSERT INTO exercises (routine_id, name, sets, reps, weight, day) VALUES (?, ?, ?, ?, ?, ?)",
                    args: [
                        routineId, 
                        ex.name, 
                        ex.sets || 0, 
                        ex.reps || 0, 
                        ex.weight || 0, 
                        ex.day || 1
                    ]
                });
            }
        }

        res.json({ msg: 'Rutina actualizada correctamente' });

    } catch (err) {
        console.error("Error al actualizar rutina:", err.message);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;