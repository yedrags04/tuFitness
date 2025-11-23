// backend/routes/routines.js
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Routine, Exercise, Op } = require('../db/sequelize'); 

// Middleware para verificar token (seguridad de la API)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(" ")[1] || authHeader;
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
// @desc    Obtener todas las rutinas (Propias + Predeterminadas)
router.get('/', verifyToken, async (req, res) => {
  try {
    // Busca donde UserId es el usuario logueado OR isDefault es true
    const routines = await Routine.findAll({
      where: {
        [Op.or]: [
          { UserId: req.user.id },
          { isDefault: true }
        ]
      },
      include: Exercise, 
      order: [['id', 'DESC']]
    });
    
    res.status(200).json(routines);
  } catch (err) {
    res.status(500).send('Error del servidor');
  }
});

// @route   PUT api/routines/:id
// @desc    Editar rutina (solo si es propia del usuario y no predeterminada)
router.put('/:id', verifyToken, async (req, res) => {
  const routineId = req.params.id;
  const { name, focus, exercises } = req.body;

  try {
    const routine = await Routine.findOne({ where: { id: routineId } });
    
    if (!routine) {
      return res.status(404).json("Rutina no encontrada.");
    }
    
    // Verificación CLAVE
    if (routine.UserId !== req.user.id || routine.isDefault) {
      return res.status(403).json("No tienes permiso para editar esta rutina (es predeterminada o de otro usuario).");
    }

    // Actualización de la rutina principal
    await routine.update({ name, focus });
    
    // Actualizar los ejercicios relacionados
    if (exercises) {
      await Exercise.destroy({ where: { RoutineId: routineId } });
      const updatedExercises = exercises.map(ex => ({ ...ex, RoutineId: routineId }));
      await Exercise.bulkCreate(updatedExercises);
    }

    res.status(200).json({ msg: "Rutina actualizada con éxito" });

  } catch (err) {
    res.status(500).send('Error del servidor al editar rutina');
  }
});

module.exports = router;