import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import './css/Rutinas.css';

const Rutinas = () => {
  const [misRutinas, setMisRutinas] = useState([]);
  const [rutinasPredeterminadas, setRutinasPredeterminadas] = useState([]);
  const navigate = useNavigate(); // Hook para navegación

  useEffect(() => {
    const fetchRoutines = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login'); // Redirigir si no hay token
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/routines', {
          headers: { 'x-auth-token': token },
        });

        // Separamos las rutinas que vienen del backend
        const allRoutines = res.data;
        const propias = allRoutines.filter(r => !r.isDefault);
        const defaults = allRoutines.filter(r => r.isDefault);

        setMisRutinas(propias);
        setRutinasPredeterminadas(defaults);

      } catch (err) {
        console.error(err);
        // Manejo de error básico (ej: token expirado)
      }
    };

    fetchRoutines();
  }, [navigate]);

  // Función para ir a crear
  const handleCrearRutina = () => {
      // Asumiendo que EditarRutina maneja la creación si no recibe ID,
      // o puedes crear una ruta especifica '/crear-rutina'
      navigate('/editar-rutina/nueva'); 
  };

  const handleEditar = (id) => {
    navigate(`/editar-rutina/${id}`);
  };

  const handleEliminar = async (id) => {
    if(!window.confirm("¿Estás seguro de eliminar esta rutina?")) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/routines/${id}`, {
        headers: { 'x-auth-token': token },
      });
      // Actualizar estado local eliminando la rutina borrada
      setMisRutinas(misRutinas.filter(routine => routine._id !== id));
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la rutina");
    }
  };

  // Componente auxiliar para renderizar una tarjeta (para no repetir código)
  const RoutineCard = ({ routine, isEditable }) => (
    <div className="routine-card" key={routine._id}>
      <h3>{routine.name}</h3>
      <ul>
        {routine.exercises.map((exercise, index) => (
          <li key={index}>
            <strong>{exercise.name}:</strong> {exercise.sets} series x {exercise.reps} reps
          </li>
        ))}
      </ul>
      {isEditable && (
        <div className="routine-actions">
          <button className="btn-edit" onClick={() => handleEditar(routine._id)}>Editar</button>
          <button className="btn-delete" onClick={() => handleEliminar(routine._id)}>Eliminar</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="rutinas-container">
      
      <div className="rutinas-header">
          <h2>Mis Rutinas</h2>
          <button className="btn-crear" onClick={handleCrearRutina}>
            + Nueva Rutina
          </button>
      </div>

      {/* Sección Mis Rutinas */}
      <div className="routines-grid">
        {misRutinas.length > 0 ? (
          misRutinas.map((routine) => (
            <RoutineCard key={routine._id} routine={routine} isEditable={true} />
          ))
        ) : (
          <p>No has creado rutinas todavía.</p>
        )}
      </div>

      <hr className="divider" />

      {/* Sección Rutinas Predeterminadas */}
      <h2>Rutinas Recomendadas (Predeterminadas)</h2>
      <div className="routines-grid">
        {rutinasPredeterminadas.length > 0 ? (
          rutinasPredeterminadas.map((routine) => (
            <RoutineCard key={routine._id} routine={routine} isEditable={false} />
          ))
        ) : (
          <p>No hay rutinas predeterminadas disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default Rutinas;