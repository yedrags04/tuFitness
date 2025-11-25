import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/Rutinas.css';

const Rutinas = () => {
  const [misRutinas, setMisRutinas] = useState([]);
  const [rutinasPredeterminadas, setRutinasPredeterminadas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Estado para el formulario de Nueva Rutina
  const [newRoutine, setNewRoutine] = useState({
    name: '',
    dayCount: 1,
    duration: '', // ej: "60 min"
    daysData: [
        // Estructura inicial para el día 1
        { dayNumber: 1, exercises: [{ name: '', sets: '', reps: '', weight: '' }] }
    ]
  });

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

  // Actualizar campos simples (nombre, dias, duracion)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'dayCount') {
        // Lógica especial al cambiar el número de días para ajustar el array
        const count = parseInt(value) || 1;
        setNewRoutine(prev => {
            const newDays = [...prev.daysData];
            if (count > newDays.length) {
                // Añadir días vacíos
                for (let i = newDays.length + 1; i <= count; i++) {
                    newDays.push({ dayNumber: i, exercises: [{ name: '', sets: '', reps: '', weight: '' }] });
                }
            } else {
                // Recortar días si el usuario reduce el número
                newDays.length = count;
            }
            return { ...prev, dayCount: count, daysData: newDays };
        });
    } else {
        setNewRoutine({ ...newRoutine, [name]: value });
    }
  };

  // Actualizar datos de un ejercicio específico
  const handleExerciseChange = (dayIndex, exerciseIndex, field, value) => {
    const updatedDays = [...newRoutine.daysData];
    updatedDays[dayIndex].exercises[exerciseIndex][field] = value;
    setNewRoutine({ ...newRoutine, daysData: updatedDays });
  };

  // Añadir un nuevo ejercicio a un día específico
  const addExercise = (dayIndex) => {
    const updatedDays = [...newRoutine.daysData];
    updatedDays[dayIndex].exercises.push({ name: '', sets: '', reps: '', weight: '' });
    setNewRoutine({ ...newRoutine, daysData: updatedDays });
  };

  // Eliminar un ejercicio
  const removeExercise = (dayIndex, exerciseIndex) => {
    const updatedDays = [...newRoutine.daysData];
    updatedDays[dayIndex].exercises.splice(exerciseIndex, 1);
    setNewRoutine({ ...newRoutine, daysData: updatedDays });
  };

  // ENVIAR EL FORMULARIO
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // Aplanamos la estructura para enviarla al backend de forma sencilla
    // El backend recibirá un array plano de ejercicios, cada uno con su propiedad 'day'
    const flatExercises = [];
    newRoutine.daysData.forEach(day => {
        day.exercises.forEach(ex => {
            if(ex.name.trim() !== '') { // Solo añadir si tiene nombre
                flatExercises.push({
                    ...ex,
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
      await axios.post('http://localhost:5000/api/routines', payload, {
        headers: { 'x-auth-token': token }
      });
      alert("Rutina creada con éxito!");
      setShowModal(false);
      setNewRoutine({ name: '', dayCount: 1, duration: '', daysData: [{ dayNumber: 1, exercises: [{ name: '', sets: '', reps: '', weight: '' }] }] }); // Reset
      fetchRoutines(); // Recargar lista
    } catch (err) {
      console.error(err);
      alert("Error al guardar la rutina");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar rutina?")) return;
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/routines/${id}`, { headers: { 'x-auth-token': token } });
        fetchRoutines();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="rutinas-container">
      <div className="rutinas-header">
        <h2>Mis Rutinas</h2>
        <button className="btn-crear" onClick={() => setShowModal(true)}>
          + Nueva Rutina
        </button>
      </div>

      <div className="routines-grid">
        {misRutinas.length > 0 ? (
          misRutinas.map((routine) => (
            <div className="routine-card" key={routine._id || routine.id}>
              <h3>{routine.name}</h3>
              <p style={{fontSize:'0.9em', color:'#aaa'}}>Duración: {routine.duration || 'N/A'}</p>
              <ul>
                {/* Mostramos un resumen de los primeros 3 ejercicios */}
                {routine.exercises && routine.exercises.slice(0,3).map((ex, i) => (
                  <li key={i}>Día {ex.day || 1}: {ex.name} ({ex.sets}x{ex.reps})</li>
                ))}
                {routine.exercises && routine.exercises.length > 3 && <li>...</li>}
              </ul>
              <div className="routine-actions">
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

      {/* --- MODAL FLOTANTE --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            <h2>Crear Nueva Rutina</h2>
            
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
                </div>

                <div className="exercises-container">
                    {newRoutine.daysData.map((day, dayIndex) => (
                        <div key={dayIndex} className="day-section">
                            <h4>Día {day.dayNumber}</h4>
                            
                            {/* Encabezados de columnas */}
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
                    <button type="button" onClick={() => setShowModal(false)} style={{background:'transparent', border:'1px solid #555', color:'white', padding:'10px 20px', borderRadius:'5px', cursor:'pointer'}}>Cancelar</button>
                    <button type="submit" className="btn-save">Guardar Rutina</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rutinas;