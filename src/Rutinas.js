import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/Rutinas.css';

const Rutinas = () => {
  const [misRutinas, setMisRutinas] = useState([]);
  const [rutinasPredeterminadas, setRutinasPredeterminadas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // --- CAMBIO: Estado para saber si estamos editando (null = creando, ID = editando) ---
  const [editingId, setEditingId] = useState(null); 
  
  const navigate = useNavigate();

  // Estado inicial vacío (lo extraemos a una variable para reutilizarlo al resetear)
  const initialRoutineState = {
    name: '',
    dayCount: 1,
    duration: '',
    daysData: [
        { dayNumber: 1, exercises: [{ name: '', sets: '', reps: '', weight: '' }] }
    ]
  };

  const [newRoutine, setNewRoutine] = useState(initialRoutineState);

  const fetchRoutines = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/iniciar-sesion');

    try {
      const res = await axios.get('http://localhost:5000/api/routines', {
        headers: { 'x-auth-token': token },
      });
      const allRoutines = res.data;
      setMisRutinas(allRoutines.filter(r => !r.isDefault));
      setRutinasPredeterminadas(allRoutines.filter(r => r.isDefault));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, [navigate]);

  // --- LÓGICA DEL FORMULARIO ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'dayCount') {
        const count = parseInt(value) || 1;
        setNewRoutine(prev => {
            const newDays = [...prev.daysData];
            if (count > newDays.length) {
                for (let i = newDays.length + 1; i <= count; i++) {
                    newDays.push({ dayNumber: i, exercises: [{ name: '', sets: '', reps: '', weight: '' }] });
                }
            } else {
                newDays.length = count;
            }
            return { ...prev, dayCount: count, daysData: newDays };
        });
    } else {
        setNewRoutine({ ...newRoutine, [name]: value });
    }
  };

  const handleExerciseChange = (dayIndex, exerciseIndex, field, value) => {
    const updatedDays = [...newRoutine.daysData];
    updatedDays[dayIndex].exercises[exerciseIndex][field] = value;
    setNewRoutine({ ...newRoutine, daysData: updatedDays });
  };

  const addExercise = (dayIndex) => {
    const updatedDays = [...newRoutine.daysData];
    updatedDays[dayIndex].exercises.push({ name: '', sets: '', reps: '', weight: '' });
    setNewRoutine({ ...newRoutine, daysData: updatedDays });
  };

  const removeExercise = (dayIndex, exerciseIndex) => {
    const updatedDays = [...newRoutine.daysData];
    updatedDays[dayIndex].exercises.splice(exerciseIndex, 1);
    setNewRoutine({ ...newRoutine, daysData: updatedDays });
  };

  // --- CAMBIO: Función para cerrar modal y limpiar estados ---
  const closeAndResetModal = () => {
    setShowModal(false);
    setNewRoutine(initialRoutineState);
    setEditingId(null); // Importante: volver a modo "crear"
  };

  // --- CAMBIO: Función para preparar la edición ---
  // --- Función para preparar la edición (CORREGIDA) ---
  const handleEditClick = (routine) => {
    // 1. PROTECCIÓN: Si routine.exercises no existe, usamos un array vacío []
    // Esto evita el error del .reduce
    const currentExercises = routine.exercises || [];

    // 2. Calculamos cuántos días tiene la rutina basándonos en los ejercicios seguros
    const maxDay = currentExercises.reduce((max, ex) => Math.max(max, ex.day || 1), 1);
    
    // 3. Reconstruimos la estructura anidada (daysData)
    const reconstructedDays = [];
    for (let i = 1; i <= maxDay; i++) {
        // Filtramos usando currentExercises
        const exercisesForDay = currentExercises
            .filter(ex => (ex.day || 1) === i)
            .map(ex => ({
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                weight: ex.weight
            }));
        
        // Si un día no tiene ejercicios, le ponemos uno vacío para que no rompa el UI
        if (exercisesForDay.length === 0) {
            exercisesForDay.push({ name: '', sets: '', reps: '', weight: '' });
        }

        reconstructedDays.push({
            dayNumber: i,
            exercises: exercisesForDay
        });
    }

    // 4. Llenamos el estado con los datos transformados
    setNewRoutine({
        name: routine.name,
        duration: routine.duration || '',
        dayCount: maxDay,
        daysData: reconstructedDays
    });

    // 5. Cambiamos a modo edición y mostramos modal
    setEditingId(routine._id || routine.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar rutina?")) return;
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/routines/${id}`, { headers: { 'x-auth-token': token } });
        fetchRoutines();
    } catch (err) { console.error(err); }
  };

  // --- ENVIAR EL FORMULARIO (CREAR O EDITAR) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // 1. Aplanamos la estructura para enviarla al backend
    // El backend espera un array plano, no dividido por días
    const flatExercises = [];
    newRoutine.daysData.forEach(day => {
        day.exercises.forEach(ex => {
            if(ex.name && ex.name.trim() !== '') { // Solo añadir si tiene nombre
                flatExercises.push({
                    name: ex.name,
                    sets: parseInt(ex.sets) || 0, 
                    reps: parseInt(ex.reps) || 0, 
                    weight: parseFloat(ex.weight) || 0, 
                    day: day.dayNumber
                });
            }
        });
    });

    const payload = {
        name: newRoutine.name,
        duration: newRoutine.duration,
        exercises: flatExercises
    };

    try {
      if (editingId) {
        // --- CASO EDITAR: Si hay editingId, hacemos PUT ---
        await axios.put(`http://localhost:5000/api/routines/${editingId}`, payload, {
            headers: { 'x-auth-token': token }
        });
        alert("Rutina actualizada con éxito!");
      } else {
        // --- CASO CREAR: Si NO hay editingId, hacemos POST ---
        await axios.post('http://localhost:5000/api/routines', payload, {
            headers: { 'x-auth-token': token }
        });
        alert("Rutina creada con éxito!");
      }
      
      closeAndResetModal(); // Limpiar y cerrar el modal
      fetchRoutines();      // Recargar la lista de rutinas en pantalla
    } catch (err) {
      console.error(err);
      alert("Error al guardar la rutina");
    }
  };

  return (
    <div className="rutinas-container">
      <div className="rutinas-header">
        <h2>Mis Rutinas</h2>
        {/* Al dar click en Nueva Rutina, nos aseguramos de que no haya ID de edición */}
        <button className="btn-crear" onClick={() => { setEditingId(null); setNewRoutine(initialRoutineState); setShowModal(true); }}>
          + Nueva Rutina
        </button>
      </div>

      <div className="routines-grid">
        {misRutinas.length > 0 ? (
          misRutinas.map((routine) => (
            <div className="routine-card" key={routine._id || routine.id}>
              <h3>{routine.name}</h3>
              <p style={{fontSize:'0.9em', color:'#1d2122ff'}}>Duración: {routine.duration || 'N/A'}</p>
              <ul>
                {routine.exercises && routine.exercises.slice(0,3).map((ex, i) => (
                  <li key={i}>Día {ex.day || 1}: {ex.name} ({ex.sets}x{ex.reps})</li>
                ))}
                {routine.exercises && routine.exercises.length > 3 && <li>...</li>}
              </ul>
              <div className="routine-actions">
                 {/* --- CAMBIO: Botón Editar reutiliza el modal --- */}
                 <button className="btn-edit" onClick={() => handleEditClick(routine)}>
                   Editar
                 </button>
                 <button className="btn-delete" onClick={() => handleDelete(routine._id || routine.id)}>Borrar</button>
              </div>
            </div>
          ))
        ) : (
          <p>No has creado rutinas todavía.</p>
        )}
      </div>

      <hr className="divider" style={{margin:'40px 0', borderColor:'#333'}} />
      
      <h2>Rutinas Recomendadas</h2>
      <div className="routines-grid">
         {rutinasPredeterminadas.map((routine) => (
             <div className="routine-card" key={routine._id || routine.id}>
                <h3>{routine.name}</h3>
                <ul>
                    {routine.exercises && routine.exercises.map((ex, i) => <li key={i}>{ex.name}</li>)}
                </ul>
             </div>
         ))}
      </div>

      {/* --- MODAL FLOTANTE (Ahora sirve para Crear y Editar) --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={closeAndResetModal}>×</button>
            {/* Título dinámico */}
            <h2>{editingId ? 'Editar Rutina' : 'Crear Nueva Rutina'}</h2>
            
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label>Nombre de la Rutina</label>
                        <input name="name" value={newRoutine.name} onChange={handleInputChange} required placeholder="Ej: Hipertrofia 4 Días" />
                    </div>
                    <div className="form-group" >
                        <label>Días/Sem</label>
                        <input type="number" name="dayCount" min="1" max="7" value={newRoutine.dayCount} onChange={handleInputChange} />
                    </div>
                    {/* Campo opcional de duración si lo deseas editar */}
                    <div className="form-group" >
                        <label>Duración</label>
                        <input name="duration" value={newRoutine.duration} onChange={handleInputChange} placeholder="Ej: 60 min" />
                    </div>
                </div>

                <div className="exercises-container">
                    {newRoutine.daysData.map((day, dayIndex) => (
                        <div key={dayIndex} className="day-section">
                            <h4>Día {day.dayNumber}</h4>
                            
                            <div className="exercise-row" >
                                <span>Ejercicio</span>
                                <span>Series</span>
                                <span>Reps</span>
                                <span>Peso</span>
                                <span></span>
                            </div>

                            {day.exercises.map((exercise, exIndex) => (
                                <div key={exIndex} className="exercise-row">
                                    <input 
                                        placeholder="Nombre Ejercicio" 
                                        value={exercise.name} 
                                        onChange={(e) => handleExerciseChange(dayIndex, exIndex, 'name', e.target.value)}
                                    />
                                    <input 
                                        placeholder="Sets" 
                                        type="number"
                                        value={exercise.sets} 
                                        onChange={(e) => handleExerciseChange(dayIndex, exIndex, 'sets', e.target.value)}
                                    />
                                    <input 
                                        placeholder="Reps" 
                                        type="number"
                                        value={exercise.reps} 
                                        onChange={(e) => handleExerciseChange(dayIndex, exIndex, 'reps', e.target.value)}
                                    />
                                    <input 
                                        placeholder="Kg" 
                                        type="number"
                                        value={exercise.weight} 
                                        onChange={(e) => handleExerciseChange(dayIndex, exIndex, 'weight', e.target.value)}
                                    />
                                    <button type="button" className="btn-remove" onClick={() => removeExercise(dayIndex, exIndex)}>x</button>
                                </div>
                            ))}
                            
                            <button type="button" className="btn-add-exercise" onClick={() => addExercise(dayIndex)}>
                                + Añadir ejercicio al Día {day.dayNumber}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={closeAndResetModal}>Cancelar</button>
                    {/* Botón dinámico */}
                    <button type="submit" className="btn-save">
                        {editingId ? 'Actualizar Rutina' : 'Guardar Rutina'}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rutinas;