import React, { useState } from 'react';
import './css/EditarRutina.css';


function EditarRutina() {
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSerieModal, setShowSerieModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);

  
  const [currentItem, setCurrentItem] = useState(null);

  // --- FUNCIONES PARA ABRIR/CERRAR VENTANAS ---

  // 1. Eliminar Ejercicio
  const handleDeleteClick = (exerciseName) => {
    setCurrentItem(exerciseName); // Guardamos qué ejercicio queremos borrar
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    alert(`Se ha eliminado el ejercicio: ${currentItem}`); // Aquí iría la lógica real de borrado
    setShowDeleteModal(false);
  };

  // 2. Añadir Serie
  const handleAddSerieClick = (exerciseName) => {
    setCurrentItem(exerciseName);
    setShowSerieModal(true);
  };

  const saveSerie = (e) => {
    e.preventDefault();
    // Aquí recogerías los datos del form (e.target.reps.value, etc.)
    alert(`Serie añadida a ${currentItem}`);
    setShowSerieModal(false);
  };

  // 3. Añadir Ejercicio
  const handleAddExerciseClick = () => {
    setShowExerciseModal(true);
  };

  const saveExercise = (e) => {
    e.preventDefault();
    alert("Ejercicio nuevo añadido");
    setShowExerciseModal(false);
  };


  return (
    <div className="rutina-page">
      <h1>Rutina 1</h1>
      
      <div className="dias-container">
        
        {/* --- DIA 1 --- */}
        <div className="Dias">
          <h2>DIA 1</h2>
          <h3>Dia de Gluteo</h3>
          <h4>Ejercicios</h4>

          {/* Ejercicio 1 */}
          <div className="ejercicio">
            <h5>Hip thrust</h5>
            <div className="serie">
              <h6>Serie 1</h6>
              <p>Repeticiones: 12</p>
              <p>Peso: 15 kg</p>
            </div>
            {/* ... más series ... */}
            
            {/* BOTONES DEL EJERCICIO */}
            <button 
                className="btn-action btn-add-serie" 
                onClick={() => handleAddSerieClick("Hip thrust")}
            >
                + Añadir Serie
            </button>
            <button 
                className="btn-action btn-delete"
                onClick={() => handleDeleteClick("Hip thrust")}
            >
                Eliminar ejercicio
            </button>
          </div>

          {/* Ejercicio 2 */}
          <div className="ejercicio">
            <h5>Sentadilla búlgara</h5>
            <div className="serie">
              <h6>Serie 1</h6>
              <p>Repeticiones: 12</p>
              <p>Peso: 15 kg</p>
            </div>
            
            {/* BOTONES DEL EJERCICIO */}
            <button 
                className="btn-action btn-add-serie"
                onClick={() => handleAddSerieClick("Sentadilla búlgara")}
            >
                + Añadir Serie
            </button>
            <button 
                className="btn-action btn-delete"
                onClick={() => handleDeleteClick("Sentadilla búlgara")}
            >
                Eliminar ejercicio
            </button>
          </div>

          {/* BOTÓN GENERAL DEL DÍA */}
          <button 
            className="btn-action btn-add-exercise"
            onClick={handleAddExerciseClick}
          >
            + Añadir ejercicio
          </button>

        </div>

        {/* --- DIA 2 (Ejemplo breve) --- */}
        <div className="Dias">
            <h2>DIA 2</h2>
            <h3>Dia de tren superior</h3>
            {/* ... contenido ... */}
             <button 
                className="btn-action btn-add-exercise"
                onClick={handleAddExerciseClick}
            >
                + Añadir ejercicio
            </button>
        </div>

      </div>

      {/* ========================================== */}
      {/* VENTANAS EMERGENTES (MODALES)              */}
      {/* ========================================== */}

      {/* 1. MODAL ELIMINAR */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>⚠️ ¿Estás seguro?</h3>
            <p>Vas a eliminar el ejercicio <strong>{currentItem}</strong>. Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button className="btn-action btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
              <button className="btn-action btn-danger" onClick={confirmDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL AÑADIR SERIE */}
      {showSerieModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Añadir Serie</h3>
            <p>Para: <strong>{currentItem}</strong></p>
            <form onSubmit={saveSerie}>
                <div className="modal-input-group">
                    <label>Repeticiones:</label>
                    <input type="number" name="reps" placeholder="Ej: 12" required />
                </div>
                <div className="modal-input-group">
                    <label>Peso (kg):</label>
                    <input type="number" name="weight" placeholder="Ej: 20" required />
                </div>
                <div className="modal-actions">
                    <button type="button" className="btn-action btn-cancel" onClick={() => setShowSerieModal(false)}>Cancelar</button>
                    <button type="submit" className="btn-action btn-confirm">Guardar</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL AÑADIR EJERCICIO */}
      {showExerciseModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nuevo Ejercicio</h3>
            <form onSubmit={saveExercise}>
                <div className="modal-input-group">
                    <label>Grupo Muscular:</label>
                    <select>
                        <option>Glúteo</option>
                        <option>Pierna</option>
                        <option>Espalda</option>
                        <option>Pecho</option>
                    </select>
                </div>
                <div className="modal-input-group">
                    <label>Ejercicio:</label>
                    <select>
                        <option>Sentadilla</option>
                        <option>Hip Thrust</option>
                        <option>Peso Muerto</option>
                        <option>Prensa</option>
                        {/* Aquí podrías cargar una lista dinámica */}
                    </select>
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