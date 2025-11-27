const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Ahora sí funcionará
const { createClient } = require("@libsql/client");

// Configuración rápida del cliente (idealmente impórtalo de db/sequelize.js si ya lo tienes ahí)
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ==========================================
// 1. OBTENER RUTINAS (Usuario + Predeterminadas)
// ==========================================
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // A) Buscar rutinas: Las del usuario (user_id = ?) O las públicas (is_default = 1)
    const routinesResult = await client.execute({
      sql: "SELECT * FROM routines WHERE user_id = ? OR is_default = 1 ORDER BY is_default DESC, id DESC",
      args: [userId] 
    });
    
    const routines = routinesResult.rows;

    // B) Si no hay rutinas, devolver array vacío
    if (routines.length === 0) {
      return res.json([]);
    }

    // C) Buscar los ejercicios de ESAS rutinas
    // Creamos placeholders (?, ?, ?) para la query IN
    const routineIds = routines.map(r => r.id);
    const placeholders = routineIds.map(() => '?').join(',');
    
    const exercisesResult = await client.execute({
      sql: `SELECT * FROM exercises WHERE routine_id IN (${placeholders}) ORDER BY day ASC`,
      args: routineIds
    });

    const exercises = exercisesResult.rows;

    // D) Combinar Rutinas con sus Ejercicios
    const completeRoutines = routines.map(routine => {
      return {
        ...routine,
        // Convertir 1/0 a boolean real para el frontend
        isDefault: Boolean(routine.is_default), 
        exercises: exercises.filter(ex => ex.routine_id === routine.id)
      };
    });

    res.json(completeRoutines);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// ==========================================
// 2. OBTENER UNA RUTINA ESPECÍFICA
// ==========================================
router.get('/:id', auth, async (req, res) => {
  try {
    const routineResult = await client.execute({
      sql: "SELECT * FROM routines WHERE id = ?",
      args: [req.params.id]
    });

    if (routineResult.rows.length === 0) return res.status(404).json({ msg: 'Rutina no encontrada' });
    
    const routine = routineResult.rows[0];

    // Verificar permiso: Debe ser del usuario O ser predeterminada
    if (routine.user_id !== req.user.id && !routine.is_default) {
        return res.status(401).json({ msg: 'No autorizado' });
    }

    const exercisesResult = await client.execute({
      sql: "SELECT * FROM exercises WHERE routine_id = ?",
      args: [routine.id]
    });

    res.json({ ...routine, exercises: exercisesResult.rows });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error Server');
  }
});

// ==========================================
// 3. CREAR RUTINA (POST)
// ==========================================
router.post('/', auth, async (req, res) => {
  const { name, duration, exercises, dayCount } = req.body;

  try {
    // Insertar Rutina
    const result = await client.execute({
      sql: "INSERT INTO routines (user_id, name, duration, is_default) VALUES (?, ?, ?, 0) RETURNING id",
      args: [req.user.id, name, duration]
    });
    
    // Turso devuelve el ID insertado de forma distinta a veces, aseguramos capturarlo
    // Si usas 'returning id', está en result.rows[0].id
    const routineId = result.rows[0].id || result.lastInsertRowid; 

    // Insertar Ejercicios
    if (exercises && exercises.length > 0) {
      for (const ex of exercises) {
        await client.execute({
          sql: "INSERT INTO exercises (routine_id, name, sets, reps, weight, day) VALUES (?, ?, ?, ?, ?, ?)",
          args: [Number(routineId), ex.name, ex.sets, ex.reps, ex.weight, ex.day]
        });
      }
    }

    res.json({ id: routineId, msg: 'Rutina creada' });

  } catch (err) {
    console.error("Error creando:", err);
    res.status(500).send('Error al crear rutina');
  }
});

// ==========================================
// 4. EDITAR RUTINA (PUT) - PROTEGIDO
// ==========================================
router.put('/:id', auth, async (req, res) => {
    const { name, duration, exercises } = req.body;
    const routineId = req.params.id;
    const userId = req.user.id;

    try {
        // A) Verificar que la rutina existe y PERTENECE al usuario
        // Si es is_default = 1, NO dejamos editarla (solo copiar/personalizar en frontend)
        const check = await client.execute({
            sql: "SELECT * FROM routines WHERE id = ?",
            args: [routineId]
        });

        if (check.rows.length === 0) return res.status(404).json({ msg: 'Rutina no encontrada' });
        
        const routine = check.rows[0];

        // PROTECCIÓN CRÍTICA: No editar rutinas predeterminadas ni de otros
        if (routine.is_default) {
            return res.status(403).json({ msg: 'No puedes editar una rutina predeterminada. Crea una copia.' });
        }
        if (routine.user_id !== userId) {
            return res.status(401).json({ msg: 'No autorizado para editar esta rutina' });
        }

        // B) Actualizar datos
        await client.execute({
            sql: "UPDATE routines SET name = ?, duration = ? WHERE id = ?",
            args: [name, duration, routineId]
        });

        // C) Actualizar ejercicios (Borrar y Re-insertar es más limpio)
        await client.execute({ sql: "DELETE FROM exercises WHERE routine_id = ?", args: [routineId] });

        if (exercises && exercises.length > 0) {
            for (const ex of exercises) {
                await client.execute({
                    sql: "INSERT INTO exercises (routine_id, name, sets, reps, weight, day) VALUES (?, ?, ?, ?, ?, ?)",
                    args: [routineId, ex.name, ex.sets || 0, ex.reps || 0, ex.weight || 0, ex.day || 1]
                });
            }
        }

        res.json({ msg: 'Rutina actualizada correctamente' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// ==========================================
// 5. BORRAR RUTINA (DELETE) - PROTEGIDO
// ==========================================
router.delete('/:id', auth, async (req, res) => {
  try {
    const routineId = req.params.id;
    const userId = req.user.id;

    // Verificar propiedad
    const check = await client.execute({
        sql: "SELECT * FROM routines WHERE id = ?",
        args: [routineId]
    });

    if (check.rows.length === 0) return res.status(404).json({ msg: 'Rutina no encontrada' });
    const routine = check.rows[0];

    // PROTECCIÓN
    if (routine.is_default) {
        return res.status(403).json({ msg: 'No puedes borrar una rutina predeterminada.' });
    }
    if (routine.user_id !== userId) {
        return res.status(401).json({ msg: 'No autorizado' });
    }

    // Borrar
    await client.execute({ sql: "DELETE FROM exercises WHERE routine_id = ?", args: [routineId] });
    await client.execute({ sql: "DELETE FROM routines WHERE id = ?", args: [routineId] });

    res.json({ msg: 'Rutina eliminada' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;