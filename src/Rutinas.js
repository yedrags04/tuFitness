import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/Rutinas.css';

const Rutinas = () => {
  const [misRutinas, setMisRutinas] = useState([]);
  const [rutinasPredeterminadas, setRutinasPredeterminadas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // 'create', 'edit', 'view', 'customize', 'adjust'
  const [modalMode, setModalMode] = useState('create'); 

  const navigate = useNavigate();

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

  const mapRoutineToForm = (routine) => {
    const currentExercises = routine.exercises || routine.Exercises || [];
    
    if (!currentExercises || currentExercises.length === 0) {
        return { ...initialRoutineState, name: routine.name, duration: routine.duration || '' };
    }

    const maxDay = currentExercises.reduce((max, ex) => Math.max(max, ex.day || 1), 1);
    
    const reconstructedDays = [];
    for (let i = 1; i <= maxDay; i++) {
        const exercisesForDay = currentExercises
            .filter(ex => (ex.day || 1) === i)
            .map(ex => ({
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                weight: ex.weight
            }));
        
        if (exercisesForDay.length === 0) {
            exercisesForDay.push({ name: '', sets: '', reps: '', weight: '' });
        }

        reconstructedDays.push({
            dayNumber: i,
            exercises: exercisesForDay
        });
    }

    return {
        name: routine.name,
        duration: routine.duration || '',
        dayCount: maxDay,
        daysData: reconstructedDays
    };
  };

  // --- HANDLERS ---
  const handleEditClick = (routine) => {
    setNewRoutine(mapRoutineToForm(routine));
    setEditingId(routine._id || routine.id);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleAdjustClick = (routine) => {
    setNewRoutine(mapRoutineToForm(routine));
    setEditingId(routine._id || routine.id);
    setModalMode('adjust');
    setShowModal(true);
  };

  const handleViewDefault = (routine) => {
    setNewRoutine(mapRoutineToForm(routine));
    setEditingId(null); 
    setModalMode('view');
    setShowModal(true);
  };

  const handleCustomizeDefault = (routine) => {
    const formData = mapRoutineToForm(routine);
    formData.name = `${formData.name} (Copia)`;
    setNewRoutine(formData);
    setEditingId(null);
    setModalMode('customize');
    setShowModal(true);
  };

  const handleCreateClick = () => {
    setEditingId(null);
    setNewRoutine(initialRoutineState);
    setModalMode('create');
    setShowModal(true);
  };

  const closeAndResetModal = () => {
    setShowModal(false);
    setNewRoutine(initialRoutineState);
    setEditingId(null);
    setModalMode('create');
  };

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

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar rutina?")) return;
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/routines/${id}`, { headers: { 'x-auth-token': token } });
        fetchRoutines();
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modalMode === 'view') return;

    const token = localStorage.getItem('token');
    const flatExercises = [];
    newRoutine.daysData.forEach(day => {
        day.exercises.forEach(ex => {
            if(ex.name && ex.name.trim() !== '') {
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
      if (editingId && (modalMode === 'edit' || modalMode === 'adjust')) {
        await axios.put(`http://localhost:5000/api/routines/${editingId}`, payload, {
            headers: { 'x-auth-token': token }
        });
        alert("Rutina actualizada con éxito!");
      } else {
        await axios.post('http://localhost:5000/api/routines', payload, {
            headers: { 'x-auth-token': token }
        });
        alert("Rutina guardada en tu colección!");
      }
      closeAndResetModal();
      fetchRoutines();
    } catch (err) {
      console.error(err);
      alert("Error al guardar la rutina");
    }
  };

  const isStructureLocked = modalMode === 'view' || modalMode === 'customize' || modalMode === 'adjust';

  return (
    <div className="rutinas-container">
      <div className="rutinas-header">
        <h2>Mis Rutinas</h2>
        <button className="btn-crear" onClick={handleCreateClick}>+ Nueva Rutina</button>
      </div>

      <div className="routines-grid">
        {misRutinas.length > 0 ? (
          misRutinas.map((routine) => (
            <div className="routine-card" key={routine._id || routine.id}>
              <h3>{routine.name}</h3>
              <p style={{fontSize:'0.9em', color:'#1d2122ff'}}>Duración: {routine.duration || 'N/A'}</p>
              <div className="routine-tags">
                 <span className="tag-day">{routine.exercises ? new Set(routine.exercises.map(e=>e.day)).size : 1} Días</span>
              </div>
              <div className="routine-actions">
                 <button className="btn-view" onClick={() => handleAdjustClick(routine)}>Ver / Ajustar</button>
                 <button className="btn-edit" onClick={() => handleEditClick(routine)}>Editar Todo</button>
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
             <div className="routine-card default-card" key={routine._id || routine.id}>
                <h3>{routine.name}</h3>
                <p style={{fontSize:'0.9em', color:'#1d2122ff'}}>Duración: {routine.duration || 'N/A'}</p>
                <div className="routine-actions">
                    <button className="btn-view" onClick={() => handleViewDefault(routine)}>Ver</button>
                    <button className="btn-customize" onClick={() => handleCustomizeDefault(routine)}>Personalizar</button>
                </div>
             </div>
         ))}
      </div>

      {/* --- MODAL FLOTANTE --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content wide-modal">
            <div className="modal-header">
                <h2>
                    {modalMode === 'create' && 'Crear Nueva Rutina'}
                    {modalMode === 'edit' && 'Editar Rutina Completa'}
                    {modalMode === 'view' && 'Detalles de Rutina'}
                    {modalMode === 'customize' && 'Personalizar Rutina'}
                    {modalMode === 'adjust' && 'Ajustar Pesos y Series'}
                </h2>
                <button className="close-btn" onClick={closeAndResetModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="routine-form">
                <div className="form-top-bar">
                    <div className="form-group">
                        <label>Nombre</label>
                        <input 
                            name="name" 
                            value={newRoutine.name} 
                            onChange={handleInputChange} 
                            required 
                            disabled={modalMode === 'view' || modalMode === 'adjust'} 
                        />
                    </div>
                    <div className="form-group small-group">
                        <label>Días/Sem</label>
                        <input 
                            type="number" 
                            name="dayCount" 
                            min="1" max="7" 
                            value={newRoutine.dayCount} 
                            onChange={handleInputChange}
                            disabled={isStructureLocked} 
                        />
                    </div>
                    <div className="form-group">
                        <label>Duración</label>
                        <input 
                            name="duration" 
                            value={newRoutine.duration} 
                            onChange={handleInputChange}
                            disabled={modalMode === 'view'}
                        />
                    </div>
                </div>

                <div className="exercises-scroll-container">
                    {newRoutine.daysData.map((day, dayIndex) => (
                        <div key={dayIndex} className="day-column">
                            <h4 className="day-title">Día {day.dayNumber}</h4>
                            
                            <div className="day-exercises-list">
                                {day.exercises.map((exercise, exIndex) => (
                                    <div key={exIndex} className="exercise-box-card">
                                        {/* Cabecera de la tarjeta del ejercicio */}
                                        <div className="exercise-box-header">
                                            <input 
                                                className="ex-name-input"
                                                placeholder="Nombre Ejercicio" 
                                                value={exercise.name} 
                                                onChange={(e) => handleExerciseChange(dayIndex, exIndex, 'name', e.target.value)}
                                                disabled={isStructureLocked}
                                                title={exercise.name}
                                            />
                                            {!isStructureLocked && (
                                                <button type="button" className="btn-remove-icon" onClick={() => removeExercise(dayIndex, exIndex)}>×</button>
                                            )}
                                        </div>

                                        {/* Cuerpo de la tarjeta con los datos numéricos */}
                                        <div className="exercise-box-stats">
                                            <div className="stat-item">
                                                <label>Sets</label>
                                                <input 
                                                    type="number"
                                                    value={exercise.sets} 
                                                    onChange={(e) => handleExerciseChange(dayIndex, exIndex, 'sets', e.target.value)}
                                                    disabled={modalMode === 'view'} 
                                                />
                                            </div>
                                            <div className="stat-item">
                                                <label>Reps</label>
                                                <input 
                                                    type="number"
                                                    value={exercise.reps} 
                                                    onChange={(e) => handleExerciseChange(dayIndex, exIndex, 'reps', e.target.value)}
                                                    disabled={modalMode === 'view'} 
                                                />
                                            </div>
                                            <div className="stat-item">
                                                <label>Kg</label>
                                                <input 
                                                    type="number"
                                                    value={exercise.weight} 
                                                    onChange={(e) => handleExerciseChange(dayIndex, exIndex, 'weight', e.target.value)}
                                                    disabled={modalMode === 'view'} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {!isStructureLocked && (
                                    <button type="button" className="btn-add-card" onClick={() => addExercise(dayIndex)}>
                                        + Añadir Ejercicio
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="modal-footer-actions">
                    <button type="button" className="btn-cancel" onClick={closeAndResetModal}>
                        {modalMode === 'view' ? 'Cerrar' : 'Cancelar'}
                    </button>
                    
                    {modalMode !== 'view' && (
                        <button type="submit" className="btn-save-main">
                            {(modalMode === 'edit' || modalMode === 'adjust') ? 'Guardar Cambios' : 
                             modalMode === 'customize' ? 'Guardar en Mis Rutinas' : 
                             'Crear Rutina'}
                        </button>
                    )}
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rutinas;