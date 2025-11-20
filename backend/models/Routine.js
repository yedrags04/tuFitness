const mongoose = require('mongoose');

const RoutineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    // Quitamos el required: true estricto si quieres que haya rutinas sin usuario específico,
    // o simplemente las predeterminadas pueden tener un usuario "admin".
    // Para simplificar, dejaremos que puedan tener usuario o ser null si son del sistema.
    required: false 
  },
  name: {
    type: String,
    required: true,
  },
  exercises: [
    {
      name: { type: String, required: true },
      sets: { type: Number, required: true },
      reps: { type: Number, required: true },
    },
  ],
  // AGREGAR ESTO:
  isDefault: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('routine', RoutineSchema);