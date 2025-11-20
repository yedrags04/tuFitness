const router = require('express').Router();
const Routine = require('../models/Routine');
const jwt = require('jsonwebtoken');

// Middleware para verificar token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json("Token inválido");
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("No estás autenticado");
  }
};

// OBTENER TODAS LAS RUTINAS (Propias + Predeterminadas)
router.get('/', verifyToken, async (req, res) => {
  try {
    // MODIFICACION: Buscar por el ID del usuario O si es default
    const routines = await Routine.find({
      $or: [
        { user: req.user.id }, // Rutinas del usuario
        { isDefault: true }    // Rutinas predeterminadas
      ]
    }).sort({ date: -1 });

    res.json(routines);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// CREAR RUTINA
router.post('/', verifyToken, async (req, res) => {
  const newRoutine = new Routine({ ...req.body, user: req.user.id });
  try {
    const savedRoutine = await newRoutine.save();
    res.status(200).json(savedRoutine);
  } catch (err) {
    res.status(500).json(err);
  }
});

// EDITAR RUTINA
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (routine.user.toString() === req.user.id) { // Solo si es dueño
      const updatedRoutine = await Routine.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      res.status(200).json(updatedRoutine);
    } else {
      res.status(403).json("No puedes editar rutinas predeterminadas o de otros.");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;