const mongoose = require('mongoose');

const RoutineSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Vincula al usuario
  name: { type: String, required: true },
  focus: { type: String }, // Ej: "Espalda", "Pierna"
  daysPerWeek: { type: Number },
  duration: { type: Number }, // Horas
  exercises: [{ // Lista de ejercicios
    name: { type: String },
    series: [{ reps: Number, weight: Number }]
  }],
  isDefault: { type: Boolean, default: false } // True si es del sistema (para todos)
});

module.exports = mongoose.model('Routine', RoutineSchema);