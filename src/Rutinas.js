import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/Rutinas.css';

const Rutinas = () => {
  const [misRutinas, setMisRutinas] = useState([]);
  const [rutinasPredeterminadas, setRutinasPredeterminadas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalMode, setModalMode] = useState('create'); 
  const navigate = useNavigate();

  // Estado inicial
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

  // --- API: Cargar Rutinas ---
  const fetchRoutines = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/iniciar-sesion');

    try {
      const res = await axios.get('http://localhost:5000/api/routines', {
        headers: { 'x-auth-token': token },
      });
      const allRoutines = res.data;
      setMisRutinas(allRoutines.filter(r => !r.esPredeterminada));
      setRutinasPredeterminadas(allRoutines.filter(r => r.esPredeterminada));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, [navigate]);

  // --- HELPER: Extraer número seguro del día ---
  // Convierte "1", "Dia 1", "Lunes", etc., en un número válido.
  const extraerNumeroDia = (valor) => {
    if (!valor) return 1;
    if (typeof valor === 'number') return valor;
    
    // 1. Intentar convertir número directo ("1" -> 1)
    const parsed = parseInt(valor);
    if (!isNaN(parsed)) return parsed;

    const valStr = String(valor).toLowerCase().trim();

    // 2. Mapeo de Días de la semana a números
    const diasSemana = {
        'lunes': 1, 'martes': 2, 'miércoles': 3, 'miercoles': 3, 
        'jueves': 4, 'viernes': 5, 'sábado': 6, 'sabado': 6, 'domingo': 7,
        'monday': 1, 'tuesday': 2, 'wednesday': 3, 
        'thursday': 4, 'friday': 5, 'saturday': 6, 'sunday': 7
    };

    if (diasSemana[valStr]) return diasSemana[valStr];

    // 3. Buscar dígitos con Regex (ej: "Día 2" -> 2)
    const match = String(valor).match(/\d+/);
    if (match) return parseInt(match[0]);

    // Default
    return 1; 
  };

  // --- HELPER: Mapear BD -> Formulario ---
  const mapRoutineToForm = (routine) => {
    const currentExercises = routine.Exercises || routine.exercises || [];
    
    if (!currentExercises || currentExercises.length === 0) {
        return { ...initialRoutineState, name: routine.name || routine.nombre || '', duration: routine.duration || '' };
    }

    // 1. Calcular cuántos días tiene la rutina
    const maxDay = currentExercises.reduce((max, ex) => {
        // Usamos la función blindada
        const diaNum = extraerNumeroDia(ex.dia || ex.day); 
        return Math.max(max, diaNum);
    }, 1);
    
    const reconstructedDays = [];
    for (let i = 1; i <= maxDay; i++) {
        // 2. Filtrar ejercicios que pertenecen a este día 'i'
        const exercisesForDay = currentExercises
            .filter(ex => extraerNumeroDia(ex.dia || ex.day) === i)
            .map(ex => {
                const setsFromDB = ex.Sets || ex.sets || []; 

                let seriesFormatted = setsFromDB.map(s => ({
                    reps: s.repeticiones !== undefined && s.repeticiones !== null ? String(s.repeticiones) : '',
                    weight: s.peso !== undefined && s.peso !== null ? String(s.peso) : ''
                }));

                if (seriesFormatted.length === 0) {
                        seriesFormatted.push({ reps: '', weight: '' });
                }

                return {
                    name: ex.nombre || '', 
                    series: seriesFormatted
                };
            });
        
        // Estructura mínima si el día está vacío
        const finalExercises = exercisesForDay.length > 0 
            ? exercisesForDay 
            : [{ name: '', series: [{ reps: '', weight: '' }] }];

        reconstructedDays.push({
            dayNumber: i,
            exercises: finalExercises
        });
    }

    return {
        name: routine.name || routine.nombre,
        duration: routine.duration || '',
        dayCount: maxDay, // Ahora maxDay siempre será un número, nunca NaN
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

  const handleExerciseNameChange = (dayIndex, exIndex, value) => {
    const updatedDays = [...newRoutine.daysData];
    updatedDays[dayIndex].exercises[exIndex].name = value;
    setNewRoutine({ ...newRoutine, daysData: updatedDays });
  };

  const handleSerieChange = (dayIndex, exIndex, serieIndex, field, value) => {
    const updatedDays = [...newRoutine.daysData];
    updatedDays[dayIndex].exercises[exIndex].series[serieIndex][field] = value;
    setNewRoutine({ ...newRoutine, daysData: updatedDays });
  };

  const addSerie = (dayIndex, exIndex) => {
    const updatedDays = [...newRoutine.daysData];
    const currentSeries = updatedDays[dayIndex].exercises[exIndex].series;
    const lastSerie = currentSeries[currentSeries.length - 1];
    const newSerie = { 
        reps: lastSerie ? lastSerie.reps : '', 
        weight: lastSerie ? lastSerie.weight : '' 
    };
    currentSeries.push(newSerie);
    setNewRoutine({ ...newRoutine, daysData: updatedDays });
  };

  const removeSerie = (dayIndex, exIndex, serieIndex) => {
    const updatedDays = [...newRoutine.daysData];
    const currentSeries = updatedDays[dayIndex].exercises[exIndex].series;
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
    
    const formattedExercises = [];
    newRoutine.daysData.forEach(day => {
        day.exercises.forEach(ex => {
            if(ex.name && ex.name.trim() !== '') {
                formattedExercises.push({
                    name: ex.name,
                    day: day.dayNumber, // Enviamos el número limpio (1, 2, 3...)
                    series: ex.series 
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
        <button className="btn-crear" onClick={() => openModal(null, 'create')}>+ Nueva Rutina</button>
      </div>

      <div className="routines-grid">
        {misRutinas.length > 0 ? (
          misRutinas.map((routine) => {
            // 🛑 CORRECCIÓN: Detectar si viene como 'Exercises' o 'exercises'
            const ejerciciosReales = routine.Exercises || routine.exercises || [];
            
            // Calculamos los días únicos usando la lista correcta
            const numeroDeDias = ejerciciosReales.length > 0 
                ? new Set(ejerciciosReales.map(e => extraerNumeroDia(e.dia || e.day))).size 
                : 1;

            return (
              <div className="routine-card" key={routine._id || routine.id}>
                <h3>{routine.name || routine.nombre}</h3>
                <p style={{fontSize:'0.9em', color:'#1d2122ff'}}>Duración: {routine.duration || 'N/A'}</p>
                <div className="routine-tags">
                   {/* Usamos la variable calculada arriba */}
                   <span className="tag-day">{numeroDeDias} Días</span>
                </div>
                <div className="routine-actions">
                   <button className="btn-view" onClick={() => openModal(routine, 'adjust')}>Ver / Ajustar</button>
                   <button className="btn-edit" onClick={() => openModal(routine, 'edit')}>Editar Todo</button>
                   <button className="btn-delete" onClick={() => handleDelete(routine._id || routine.id)}>Borrar</button>
                </div>
              </div>
            );
          })
        ) : (
          <p>No has creado rutinas todavía.</p>
        )}
      </div>

      <hr className="divider" style={{margin:'40px 0', borderColor:'#333'}} />
      
      <h2>Rutinas Predeterminadas</h2>
      <div className="routines-grid">
         {rutinasPredeterminadas.map((routine) => (
             <div className="routine-card default-card" key={routine._id || routine.id}>
                <h3>{routine.name || routine.nombre}</h3>
                <div className="routine-actions">
                    <button className="btn-view" onClick={() => openModal(routine, 'view')}>Ver</button>
                    <button className="btn-customize" onClick={() => openModal(routine, 'customize')}>Personalizar</button>
                </div>
             </div>
         ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content wide-modal">
            <div className="modal-header">
                <h2>{modalMode === 'create' ? 'Crear Nueva Rutina' : 'Editar Rutina'}</h2>
                <button className="close-btn" onClick={closeAndResetModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="routine-form">
                <div className="form-top-bar">
                    <div className="form-group">
                        <label>Nombre</label>
                        <input name="name" value={newRoutine.name} onChange={handleInputChange} required disabled={modalMode === 'view' || modalMode === 'adjust'} />
                    </div>
                    <div className="form-group small-group">
                        <label>Días/Sem</label>
                        <input type="number" name="dayCount" min="1" max="7" value={newRoutine.dayCount} onChange={handleInputChange} disabled={isStructureLocked} />
                    </div>
                    <div className="form-group">
                        <label>Duración</label>
                        <input name="duration" value={newRoutine.duration} onChange={handleInputChange} disabled={modalMode === 'view'} />
                    </div>
                </div>

                <div className="exercises-scroll-container">
                    {newRoutine.daysData.map((day, dayIndex) => (
                        <div key={dayIndex} className="day-column">
                            <h4 className="day-title">Día {day.dayNumber}</h4>
                            <div className="day-exercises-list">
                                {day.exercises.map((exercise, exIndex) => (
                                    <div key={exIndex} className="exercise-box-card">
                                        <div className="exercise-box-header">
                                            <input className="ex-name-input" placeholder="Nombre Ejercicio" value={exercise.name} onChange={(e) => handleExerciseNameChange(dayIndex, exIndex, e.target.value)} disabled={isStructureLocked} />
                                            {!isStructureLocked && <button type="button" className="btn-remove-icon" onClick={() => removeExercise(dayIndex, exIndex)}>×</button>}
                                        </div>
                                        <div className="series-container">
                                            <div className="series-labels"><span>#</span><span>Reps</span><span>Kg</span><span></span></div>
                                            {exercise.series.map((serie, sIndex) => (
                                                <div key={sIndex} className="series-row">
                                                    <span className="serie-index">{sIndex + 1}</span>
                                                    <input type="number" placeholder="0" value={serie.reps} onChange={(e) => handleSerieChange(dayIndex, exIndex, sIndex, 'reps', e.target.value)} disabled={modalMode === 'view'} />
                                                    <input type="number" placeholder="0" value={serie.weight} onChange={(e) => handleSerieChange(dayIndex, exIndex, sIndex, 'weight', e.target.value)} disabled={modalMode === 'view'} />
                                                    {modalMode !== 'view' && <button type="button" className="btn-remove-serie" onClick={() => removeSerie(dayIndex, exIndex, sIndex)}>-</button>}
                                                </div>
                                            ))}
                                            {modalMode !== 'view' && <button type="button" className="btn-add-serie" onClick={() => addSerie(dayIndex, exIndex)}>+ Añadir Serie</button>}
                                        </div>
                                    </div>
                                ))}
                                {!isStructureLocked && <button type="button" className="btn-add-card" onClick={() => addExercise(dayIndex)}>+ Añadir Ejercicio</button>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="modal-footer-actions">
                    <button type="button" className="btn-cancel" onClick={closeAndResetModal}>Cancelar</button>
                    {modalMode !== 'view' && <button type="submit" className="btn-save-main">Guardar</button>}
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rutinas;