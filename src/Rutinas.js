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

  // ESTADO INICIAL: Estructura jerárquica -> Día > Ejercicio > Series
  const initialRoutineState = {
    name: '',
    dayCount: 1,
    duration: '',
    daysData: [
        { 
            dayNumber: 1, 
            exercises: [
                { name: '', series: [{ reps: '', weight: '' }] } 
            ] 
        }
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

    fetchRoutines();
  }, [navigate]); // navigate es estable, así que está bien aquí

  // --- HELPER: Mapear datos de la Base de Datos al Formulario ---
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
            .map(ex => {
                // 1. Buscamos las series (Sets) que vienen de la BD
                // Sequelize suele devolverlas en la propiedad 'Sets' (mayúscula) o 'sets'
                const setsFromDB = ex.Sets || ex.sets || [];

                // 2. Mapeamos a nuestro formato visual
                let seriesFormatted = setsFromDB.map(s => ({
                    reps: s.reps,
                    weight: s.weight
                }));

                // Si es un ejercicio antiguo sin series o viene vacío, ponemos una por defecto
                if (seriesFormatted.length === 0) {
                    // Intentamos rescatar datos antiguos si existieran en el ejercicio padre (fallback)
                    if (ex.reps || ex.weight) {
                         const setsCount = ex.sets || 1;
                         for(let k=0; k<setsCount; k++) {
                             seriesFormatted.push({ reps: ex.reps, weight: ex.weight });
                         }
                    } else {
                        seriesFormatted.push({ reps: '', weight: '' });
                    }
                }

                return {
                    name: ex.name,
                    series: seriesFormatted
                };
            });
        
        if (exercisesForDay.length === 0) {
            exercisesForDay.push({ name: '', series: [{ reps: '', weight: '' }] });
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
  const openModal = (routine, mode) => {
    if (routine) {
        const formData = mapRoutineToForm(routine);
        if (mode === 'customize') formData.name += ' (Copia)';
        setNewRoutine(formData);
        setEditingId(mode === 'edit' || mode === 'adjust' ? (routine._id || routine.id) : null);
    } else {
        setNewRoutine(initialRoutineState);
        setEditingId(null);
    }
    setModalMode(mode);
    setShowModal(true);
  };

  const closeAndResetModal = () => {
    setShowModal(false);
    setNewRoutine(initialRoutineState);
    setEditingId(null);
    setModalMode('create');
  };

  // Cambiar datos generales (Nombre rutina, dias, duracion)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dayCount') {
        const count = parseInt(value) || 1;
        setNewRoutine(prev => {
            const newDays = [...prev.daysData];
            if (count > newDays.length) {
                for (let i = newDays.length + 1; i <= count; i++) {
                    newDays.push({ 
                        dayNumber: i, 
                        exercises: [{ name: '', series: [{ reps: '', weight: '' }] }] 
                    });
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

  // Cambiar el nombre del ejercicio
  const handleExerciseNameChange = (dayIndex, exIndex, value) => {
    const updatedDays = [...newRoutine.daysData];
    updatedDays[dayIndex].exercises[exIndex].name = value;
    setNewRoutine({ ...newRoutine, daysData: updatedDays });
  };

  // --- NUEVO: Cambiar datos de una SERIE específica ---
  const handleSerieChange = (dayIndex, exIndex, serieIndex, field, value) => {
    const updatedDays = [...newRoutine.daysData];
    updatedDays[dayIndex].exercises[exIndex].series[serieIndex][field] = value;
    setNewRoutine({ ...newRoutine, daysData: updatedDays });
  };

  // --- NUEVO: Añadir una nueva Serie ---
  const addSerie = (dayIndex, exIndex) => {
    const updatedDays = [...newRoutine.daysData];
    const currentSeries = updatedDays[dayIndex].exercises[exIndex].series;
    
    // Copiamos los valores de la última serie para facilitar la entrada de datos
    const lastSerie = currentSeries[currentSeries.length - 1];
    const newSerie = { 
        reps: lastSerie ? lastSerie.reps : '', 
        weight: lastSerie ? lastSerie.weight : '' 
    };

    currentSeries.push(newSerie);
    setNewRoutine({ ...newRoutine, daysData: updatedDays });
  };

  // --- NUEVO: Eliminar una Serie ---
  const removeSerie = (dayIndex, exIndex, serieIndex) => {
    const updatedDays = [...newRoutine.daysData];
    const currentSeries = updatedDays[dayIndex].exercises[exIndex].series;

    // No permitimos dejar un ejercicio con 0 series (mínimo 1)
    if (currentSeries.length > 1) {
        currentSeries.splice(serieIndex, 1);
        setNewRoutine({ ...newRoutine, daysData: updatedDays });
    }
  };

  const addExercise = (dayIndex) => {
    const updatedDays = [...newRoutine.daysData];
    updatedDays[dayIndex].exercises.push({ name: '', series: [{ reps: '', weight: '' }] });
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
    
    // Preparamos la estructura completa (Rutina -> Ejercicios -> Series)
    const formattedExercises = [];
    newRoutine.daysData.forEach(day => {
        day.exercises.forEach(ex => {
            if(ex.name && ex.name.trim() !== '') {
                formattedExercises.push({
                    name: ex.name,
                    day: day.dayNumber,
                    series: ex.series // Enviamos el array de series
                });
            }
        });
    });

    const payload = {
        name: newRoutine.name,
        duration: newRoutine.duration,
        exercises: formattedExercises
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
        <button className="btn-crear" onClick={() => openModal(null, 'create')}>
          + Nueva Rutina
        </button>
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
                 <button className="btn-view" onClick={() => openModal(routine, 'adjust')}>Ver / Ajustar</button>
                 <button className="btn-edit" onClick={() => openModal(routine, 'edit')}>Editar Todo</button>
                 <button className="btn-delete" onClick={() => handleDelete(routine._id || routine.id)}>Borrar</button>
              </div>
            </div>
          ))
        ) : (
          <p>No has creado rutinas todavía.</p>
        )}
      </div>

      <hr className="divider" style={{margin:'40px 0', borderColor:'#333'}} />
      
      <h2>Rutinas Predeterminadas</h2>
      <div className="routines-grid">
         {rutinasPredeterminadas.map((routine) => (
             <div className="routine-card default-card" key={routine._id || routine.id}>
                <h3>{routine.name}</h3>
                <div className="routine-actions">
                    <button className="btn-view" onClick={() => openModal(routine, 'view')}>Ver</button>
                    <button className="btn-customize" onClick={() => openModal(routine, 'customize')}>Personalizar</button>
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
                    {modalMode === 'create' ? 'Crear Nueva Rutina' : 
                     modalMode === 'edit' ? 'Editar Rutina' :
                     modalMode === 'view' ? 'Detalles' : 'Personalizar Rutina'}
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
                                        
                                        {/* 1. Cabecera del Ejercicio (Nombre + Borrar Ejercicio) */}
                                        <div className="exercise-box-header">
                                            <input 
                                                className="ex-name-input"
                                                placeholder="Nombre Ejercicio" 
                                                value={exercise.name} 
                                                onChange={(e) => handleExerciseNameChange(dayIndex, exIndex, e.target.value)}
                                                disabled={isStructureLocked}
                                            />
                                            {!isStructureLocked && (
                                                <button type="button" className="btn-remove-icon" onClick={() => removeExercise(dayIndex, exIndex)}>×</button>
                                            )}
                                        </div>

                                        {/* 2. ZONA DE SERIES (Las cajitas numéricas) */}
                                        <div className="series-container">
                                            {/* Etiquetas de columnas */}
                                            <div className="series-labels">
                                                <span>#</span>
                                                <span>Reps</span>
                                                <span>Kg</span>
                                                <span></span>
                                            </div>

                                            {/* Filas de series */}
                                            {exercise.series.map((serie, sIndex) => (
                                                <div key={sIndex} className="series-row">
                                                    <span className="serie-index">{sIndex + 1}</span>
                                                    <input 
                                                        type="number" 
                                                        placeholder="0"
                                                        value={serie.reps}
                                                        onChange={(e) => handleSerieChange(dayIndex, exIndex, sIndex, 'reps', e.target.value)}
                                                        disabled={modalMode === 'view'}
                                                    />
                                                    <input 
                                                        type="number" 
                                                        placeholder="0"
                                                        value={serie.weight}
                                                        onChange={(e) => handleSerieChange(dayIndex, exIndex, sIndex, 'weight', e.target.value)}
                                                        disabled={modalMode === 'view'}
                                                    />
                                                    {/* Botón borrar serie individual */}
                                                    {modalMode !== 'view' && (
                                                        <button 
                                                            type="button" 
                                                            className="btn-remove-serie" 
                                                            onClick={() => removeSerie(dayIndex, exIndex, sIndex)}
                                                            title="Quitar serie"
                                                        >
                                                            -
                                                        </button>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Botón añadir serie */}
                                            {modalMode !== 'view' && (
                                                <button 
                                                    type="button" 
                                                    className="btn-add-serie" 
                                                    onClick={() => addSerie(dayIndex, exIndex)}
                                                >
                                                    + Añadir Serie
                                                </button>
                                            )}
                                        </div>
                                        {/* Fin Zona Series */}

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