import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/Perfil.css';

const Perfil = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estado inicial (Datos del usuario)
  const [userData, setUserData] = useState({
    nombre: '',
    email: '',
    edad: '',
    peso: '',     // en kg
    altura: '',   // en cm
    objetivo: 'Mantenimiento', // Perdida de peso, Ganancia muscular, etc.
    genero: 'Prefiero no decirlo'
  });

  // Estado temporal para guardar cambios antes de confirmar
  const [tempData, setTempData] = useState({});

  // Simulación de carga de datos (Sustituir por useEffect con Axios real)
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/iniciar-sesion');

      setLoading(true);
      try {
        // AQUÍ IRÍA TU LLAMADA REAL:
        // const res = await axios.get('http://localhost:5000/api/auth/me', { headers: { 'x-auth-token': token } });
        // setUserData(res.data);

        // MOCK DATA (Para que veas como queda el diseño ahora mismo)
        setTimeout(() => {
          setUserData({
            nombre: 'Usuario Fitness',
            email: 'usuario@ejemplo.com',
            edad: 25,
            peso: 75,
            altura: 178,
            objetivo: 'Ganancia Muscular',
            genero: 'Hombre'
          });
          setLoading(false);
        }, 500);

      } catch (err) {
        console.error(err);
        setLoading(false);
        // Si falla el token, log out
        // localStorage.removeItem('token');
        // navigate('/iniciar-sesion');
      }
    };
    fetchProfile();
  }, [navigate]);

  // Activar modo edición
  const handleEditClick = () => {
    setTempData({ ...userData }); // Hacemos copia de seguridad
    setIsEditing(true);
  };

  // Cancelar edición
  const handleCancelClick = () => {
    setUserData(tempData); // Restauramos datos originales
    setIsEditing(false);
  };

  // Manejar cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  // Guardar cambios
  const handleSaveClick = async () => {
    const token = localStorage.getItem('token');
    try {
      // AQUÍ TU PUT/POST REAL
      // await axios.put('http://localhost:5000/api/users/profile', userData, { headers: { 'x-auth-token': token } });
      
      alert("¡Perfil actualizado correctamente!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Error al actualizar perfil");
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/iniciar-sesion');
  };

  // --- CÁLCULO DE IMC (Índice de Masa Corporal) ---
  const calcularIMC = () => {
    if (userData.peso && userData.altura) {
      const alturaMetros = userData.altura / 100;
      return (userData.peso / (alturaMetros * alturaMetros)).toFixed(1);
    }
    return '--';
  };

  if (loading) return <div className="profile-container"><p>Cargando perfil...</p></div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Mi Perfil</h2>
      </div>

      <div className="profile-card-wrapper">
        
        {/* LADO IZQUIERDO: Avatar y Resumen */}
        <div className="profile-sidebar">
          <div className="avatar-circle">
            {/* Si no hay foto, mostramos inicial */}
            <span>{userData.nombre ? userData.nombre.charAt(0).toUpperCase() : 'U'}</span>
          </div>
          <h3 className="sidebar-name">{userData.nombre || 'Usuario'}</h3>
          <p className="sidebar-email">{userData.email}</p>
          
          <div className="stat-box">
            <span className="stat-label">IMC</span>
            <span className="stat-value">{calcularIMC()}</span>
          </div>
          
          <button className="btn-logout" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>

        {/* LADO DERECHO: Formulario de Datos */}
        <div className="profile-details">
          <div className="details-header">
            <h3>Información Personal</h3>
            {!isEditing ? (
              <button className="btn-edit-profile" onClick={handleEditClick}>
                ✏️ Editar
              </button>
            ) : (
              <div className="edit-actions">
                <button className="btn-cancel-edit" onClick={handleCancelClick}>Cancelar</button>
                <button className="btn-save-edit" onClick={handleSaveClick}>Guardar</button>
              </div>
            )}
          </div>

          <form className="profile-form">
            {/* Nombre */}
            <div className="form-group-profile">
              <label>Nombre Completo</label>
              <input 
                type="text" 
                name="nombre" 
                value={userData.nombre} 
                onChange={handleChange} 
                disabled={!isEditing} 
              />
            </div>

            {/* Email (Generalmente no editable o requiere validación extra) */}
            <div className="form-group-profile">
              <label>Correo Electrónico</label>
              <input 
                type="email" 
                name="email" 
                value={userData.email} 
                disabled={true} // Email bloqueado por seguridad habitual
                className="input-disabled"
              />
            </div>

            <div className="form-row">
              <div className="form-group-profile">
                <label>Edad</label>
                <input 
                  type="number" 
                  name="edad" 
                  value={userData.edad} 
                  onChange={handleChange} 
                  disabled={!isEditing} 
                />
              </div>
              <div className="form-group-profile">
                <label>Género</label>
                <select 
                  name="genero" 
                  value={userData.genero} 
                  onChange={handleChange} 
                  disabled={!isEditing}
                >
                  <option value="Hombre">Hombre</option>
                  <option value="Mujer">Mujer</option>
                  <option value="Otro">Otro</option>
                  <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                </select>
              </div>
            </div>

            <div className="form-row">
               <div className="form-group-profile">
                <label>Peso (kg)</label>
                <input 
                  type="number" 
                  name="peso" 
                  value={userData.peso} 
                  onChange={handleChange} 
                  disabled={!isEditing} 
                />
              </div>
              <div className="form-group-profile">
                <label>Altura (cm)</label>
                <input 
                  type="number" 
                  name="altura" 
                  value={userData.altura} 
                  onChange={handleChange} 
                  disabled={!isEditing} 
                />
              </div>
            </div>

            <div className="form-group-profile">
              <label>Objetivo Principal</label>
              <select 
                  name="objetivo" 
                  value={userData.objetivo} 
                  onChange={handleChange} 
                  disabled={!isEditing}
                >
                  <option value="Perdida de Peso">Pérdida de Peso</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Ganancia Muscular">Ganancia Muscular</option>
                  <option value="Resistencia">Mejorar Resistencia</option>
              </select>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Perfil;