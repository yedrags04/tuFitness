import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './css/EditarRutina.css';

function EditarRutina() {
  const { id } = useParams(); // Obtenemos el ID de la URL
  const navigate = useNavigate();

  // Estados para modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  
  // Estado principal de la rutina
  const [routineName, setRoutineName] = useState('');
  const [daysData, setDaysData] = useState([]); // Array estructurado por días
  const [loading, setLoading] = useState(true);

  // Estado para controlar qué se está editando/borrando
  // Guardamos índices: { dayIndex, exerciseIndex }
  const [targetItem, setTargetItem] = useState(null);

  // Estado temporal para el formulario de Nuevo Ejercicio
  const [newExerciseForm, setNewExerciseForm] = useState({
    name: '', sets: '', reps: '', weight: '', dayNumber: 1
  });

  // ==========================================
  // 1. CARGAR DATOS (FETCH)
  // ==========================================
  useEffect(() => {
    const fetchRoutine = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/iniciar-sesion');

      try {
        const res = await axios.get(`http://localhost:5000/api/routines/${id}`, {
          headers: { 'x-auth-token': token }
        });
        
        const routine = res.data;
        setRoutineName(routine.name);

        // TRANSFORMACIÓN DE DATOS:
        // El backend devuelve un array plano de ejercicios.
        // Lo agrupamos por día para pintarlo fácil.
        const maxDay = routine.exercises.reduce((max, ex) => Math.max(max, ex.day || 1), 0) || 1;
        const structuredDays = [];

        for (let i = 1; i <= maxDay; i++) {
            structuredDays.push({
                dayNumber: i,
                exercises: routine.exercises.filter(ex => ex.day === i)
            });
        }
        setDaysData(structuredDays);
        setLoading(false);

      } catch (err) {
        console.error(err);
        alert("Error al cargar la rutina");
        navigate('/rutinas');
      }
    };

    fetchRoutine();
  }, [id, navigate]);


  // ==========================================
  // 2. LÓGICA DE ACTUALIZACIÓN (GUARDAR CAMBIOS)
  // ==========================================
  const handleSaveRoutine = async () => {
    const token = localStorage.getItem('token');
    
    // Aplanamos de nuevo la estructura para enviarla al backend
    const flatExercises = [];
    daysData.forEach(day => {
        day.exercises.forEach(ex => {
            flatExercises.push({
                name: ex.name,
                sets: Number(ex.sets),
                reps: Number(ex.reps),
                weight: Number(ex.weight),
                day: day.dayNumber
            });
        });
    });

    try {
        await axios.put(`http://localhost:5000/api/routines/${id}`, {
            name: routineName,
            exercises: flatExercises
        }, {
            headers: { 'x-auth-token': token }
        });
        alert("Rutina actualizada correctamente");
        navigate('/rutinas');
    } catch (err) {
        console.error(err);
        alert("Error al guardar cambios");
    }
  };


  // ==========================================
  // 3. MANEJADORES DE ACCIÓN
  // ==========================================

  // --- ELIMINAR EJERCICIO ---
  const clickDelete = (dayIndex, exIndex) => {
    setTargetItem({ dayIndex, exIndex });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!targetItem) return;
    const { dayIndex, exIndex } = targetItem;
    
    const updatedDays = [...daysData];
    updatedDays[dayIndex].exercises.splice(exIndex, 1); // Borrar del array
    
    setDaysData(updatedDays);
    setShowDeleteModal(false);
    setTargetItem(null);
  };

  // --- AÑADIR EJERCICIO (ABRIR MODAL) ---
  const clickAddExercise = (dayNum) => {
    // Pre-llenamos el día correspondiente
    setNewExerciseForm({ name: '', sets: '', reps: '', weight: '', dayNumber: dayNum });
    setShowExerciseModal(true);
  };

  // --- GUARDAR NUEVO EJERCICIO ---
  const saveNewExercise = (e) => {
    e.preventDefault();
    const { dayNumber, name, sets, reps, weight } = newExerciseForm;
    
    // Buscar si el día ya existe en nuestro estado local
    const dayIndex = daysData.findIndex(d => d.dayNumber === dayNumber);
    
    const newExObj = { name, sets, reps, weight, day: dayNumber };
    const updatedDays = [...daysData];

    if (dayIndex >= 0) {
        updatedDays[dayIndex].exercises.push(newExObj);
    } else {
        // Si añadimos un ejercicio a un día que no existía visualmente aun
        updatedDays.push({ dayNumber: dayNumber, exercises: [newExObj] });
        // Ordenar por numero de día
        updatedDays.sort((a,b) => a.dayNumber - b.dayNumber);
    }

    setDaysData(updatedDays);
    setShowExerciseModal(false);
  };

  // --- EDITAR VALORES INPUT (Nombre, Series, Reps) ---
  // Esto permite editar directamente en las tarjetas sin abrir modal
  const handleInlineChange = (dayIndex, exIndex, field, value) => {
      const updatedDays = [...daysData];
      updatedDays[dayIndex].exercises[exIndex][field] = value;
      setDaysData(updatedDays);
  };


  if (loading) return <div className="rutina-page"><p>Cargando...</p></div>;

  return (
    <div className="rutina-page">
      {/* Cabecera Editable */}
      <div className="header-edit">
        <input 
            className="routine-title-input"
            value={routineName} 
            onChange={(e) => setRoutineName(e.target.value)} 
        />
        <button className="btn-save-global" onClick={handleSaveRoutine}>Guardar Cambios</button>
      </div>
      
      <div className="dias-container">
        
        {/* MAPEO DE DÍAS */}
        {daysData.map((day, dayIndex) => (
            <div className="Dias" key={day.dayNumber}>
                <h2>DÍA {day.dayNumber}</h2>
                <h4>Ejercicios</h4>

                {/* MAPEO DE EJERCICIOS DENTRO DEL DÍA */}
                {day.exercises.map((exercise, exIndex) => (
                    <div className="ejercicio" key={exIndex}>
                        {/* Nombre del Ejercicio Editable */}
                        <input 
                            className="input-exercise-name"
                            value={exercise.name}
                            onChange={(e) => handleInlineChange(dayIndex, exIndex, 'name', e.target.value)}
                            placeholder="Nombre ejercicio"
                        />
                        
                        <div className="serie">
                            {/* Usamos el diseño de "Serie" para mostrar los datos editables */}
                            <h6>Datos Generales</h6>
                            <div className="serie-inputs">
                                <label>Series:</label>
                                <input 
                                    type="number" 
                                    value={exercise.sets} 
                                    onChange={(e) => handleInlineChange(dayIndex, exIndex, 'sets', e.target.value)}
                                />
                                <label>Reps:</label>
                                <input 
                                    type="number" 
                                    value={exercise.reps} 
                                    onChange={(e) => handleInlineChange(dayIndex, exIndex, 'reps', e.target.value)}
                                />
                                <label>Peso:</label>
                                <input 
                                    type="number" 
                                    value={exercise.weight} 
                                    onChange={(e) => handleInlineChange(dayIndex, exIndex, 'weight', e.target.value)}
                                />
                            </div>
                        </div>
                        
                        {/* BOTÓN ELIMINAR */}
                        <button 
                            className="btn-action btn-delete"
                            onClick={() => clickDelete(dayIndex, exIndex)}
                        >
                            Eliminar ejercicio
                        </button>
                    </div>
                ))}

                {/* BOTÓN AÑADIR AL DÍA */}
                <button 
                    className="btn-action btn-add-exercise"
                    onClick={() => clickAddExercise(day.dayNumber)}
                >
                    + Añadir ejercicio al Día {day.dayNumber}
                </button>
            </div>
        ))}

        {/* Botón para agregar un nuevo día (opcional) */}
        <button 
            className="btn-add-day"
            onClick={() => clickAddExercise(daysData.length + 1)}
        >
            + Agregar Día Nuevo
        </button>

      </div>

      {/* ========================================== */}
      {/* MODALES                                    */}
      {/* ========================================== */}

      {/* 1. MODAL ELIMINAR */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>⚠️ ¿Estás seguro?</h3>
            <p>Se eliminará este ejercicio. Recuerda pulsar "Guardar Cambios" arriba para confirmar en la base de datos.</p>
            <div className="modal-actions">
              <button className="btn-action btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
              <button className="btn-action btn-delete" onClick={confirmDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL AÑADIR EJERCICIO */}
      {showExerciseModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nuevo Ejercicio (Día {newExerciseForm.dayNumber})</h3>
            <form onSubmit={saveNewExercise}>
                <div className="modal-input-group">
                    <label>Nombre Ejercicio:</label>
                    <input 
                        type="text" 
                        required 
                        value={newExerciseForm.name}
                        onChange={(e) => setNewExerciseForm({...newExerciseForm, name: e.target.value})}
                        placeholder="Ej: Press Banca"
                    />
                </div>
                <div className="modal-row">
                    <div className="modal-input-group">
                        <label>Series:</label>
                        <input type="number" required value={newExerciseForm.sets} onChange={(e) => setNewExerciseForm({...newExerciseForm, sets: e.target.value})}/>
                    </div>
                    <div className="modal-input-group">
                        <label>Reps:</label>
                        <input type="number" required value={newExerciseForm.reps} onChange={(e) => setNewExerciseForm({...newExerciseForm, reps: e.target.value})}/>
                    </div>
                    <div className="modal-input-group">
                        <label>Peso:</label>
                        <input type="number" value={newExerciseForm.weight} onChange={(e) => setNewExerciseForm({...newExerciseForm, weight: e.target.value})}/>
                    </div>
                </div>

                <div className="modal-actions">
                    <button type="button" className="btn-action btn-cancel" onClick={() => setShowExerciseModal(false)}>Cancelar</button>
                    <button type="submit" className="btn-action btn-confirm">Añadir</button>
                </div>
            </form>
          </div>
        </div>
      )}

    </div>   
  );
}

export default EditarRutina;