import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/Perfil.css';

const Perfil = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  
  const [userData, setUserData] = useState({
    nombre: '',
    email: '',
    edad: '',       
    genero: '',     
    peso: '',     
    altura: '',
    
    passwordActual: '',
    passwordNueva: ''
  });

  
  const [tempData, setTempData] = useState({});

  
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/iniciar-sesion');

      try {
        const res = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { 'x-auth-token': token }
        });
        
        setUserData({
            nombre: res.data.nombre || '',
            email: res.data.email || '',
            edad: res.data.edad || '', 
            peso: res.data.peso || '',
            altura: res.data.altura || '',
            genero: res.data.genero || '',
            passwordActual: '',
            passwordNueva: ''
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
        if (err.response && err.response.status === 401) {
            localStorage.removeItem('token'); 
            navigate('/iniciar-sesion');
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  
  const handleEditClick = () => {
    setTempData({ ...userData }); 
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setUserData(tempData); 
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  
  const handleSaveClick = async () => {
    const token = localStorage.getItem('token');
    
    
    if(!userData.nombre || !userData.email) {
        return alert("Nombre y Correo son obligatorios.");
    }

    try {
      await axios.put('http://localhost:5000/api/users/profile', userData, {
         headers: { 'x-auth-token': token } 
      });
      
      alert("¡Datos actualizados!");
      setIsEditing(false);
      
      setUserData(prev => ({ ...prev, passwordActual: '', passwordNueva: '' }));

      
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if(storedUser) {
          storedUser.username = userData.nombre;
          localStorage.setItem('user', JSON.stringify(storedUser));
      }

    } catch (err) {
      console.error(err);
      
      const errorMsg = err.response?.data?.msg || "Error al actualizar perfil";
      alert(errorMsg);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = "/"; 
  };

  
  const calcularIMC = () => {
    if (userData.peso && userData.altura) {
      const alturaMetros = userData.altura / 100;
      const imc = (userData.peso / (alturaMetros * alturaMetros)).toFixed(1);
      return (isNaN(imc) || !isFinite(imc)) ? '--' : imc;
    }
    return '--';
  };

  if (loading) return <div className="profile-container"><p>Cargando...</p></div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Mi Perfil</h2>
      </div>

      <div className="profile-card-wrapper">
        
        {/* SIDEBAR */}
        <div className="profile-sidebar">
          <div className="avatar-circle">
            <span>{userData.nombre ? userData.nombre.charAt(0).toUpperCase() : 'U'}</span>
          </div>
          <h3 className="sidebar-name">{userData.nombre}</h3>
          <p className="sidebar-email">{userData.email}</p>
          
          <div className="stat-box">
            <span className="stat-label">IMC</span>
            <span className="stat-value">{calcularIMC()}</span>
          </div>
          
          <button className="btn-logout" onClick={handleLogout}>Cerrar Sesión</button>
        </div>

        {/* FORMULARIO */}
        <div className="profile-details">
          <div className="details-header">
            <h3>Datos Personales</h3>
            {!isEditing ? (
              <button className="btn-edit-profile" onClick={handleEditClick}>✏️ Editar</button>
            ) : (
              <div className="edit-actions">
                <button className="btn-cancel-edit" onClick={handleCancelClick}>Cancelar</button>
                <button className="btn-save-edit" onClick={handleSaveClick}>Guardar</button>
              </div>
            )}
          </div>

          <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
            
            
            <div className="form-group-profile">
              <label>Nombre de Usuario</label>
              <input type="text" name="nombre" value={userData.nombre} onChange={handleChange} disabled={!isEditing} />
            </div>

            
            <div className="form-group-profile">
              <label>Correo Electrónico</label>
              <input type="email" name="email" value={userData.email} onChange={handleChange} disabled={!isEditing} />
            </div>

            <div className="form-row">
              
              <div className="form-group-profile">
                <label>Edad</label>
                <input type="text" value={userData.edad ? `${userData.edad} años` : '--'} disabled={true} className="input-disabled"/>
              </div>
              
              <div className="form-group-profile">
                <label>Género</label>
                <input type="text" value={userData.genero} disabled={true} className="input-disabled"/>
              </div>
            </div>

            <div className="form-row">
               
               <div className="form-group-profile">
                <label>Peso (kg)</label>
                <input type="number" name="peso" value={userData.peso} onChange={handleChange} disabled={!isEditing} />
              </div>
              
              <div className="form-group-profile">
                <label>Altura (cm)</label>
                <input type="number" name="altura" value={userData.altura} onChange={handleChange} disabled={!isEditing} />
              </div>
            </div>

            
            {isEditing && (
                <div style={{ marginTop: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }}>
                    <h4 style={{marginTop: 0, marginBottom: '10px', color: '#253237'}}>Cambiar Contraseña (Opcional)</h4>
                    
                    <div className="form-group-profile">
                        <label>Nueva Contraseña</label>
                        <input 
                            type="password" 
                            name="passwordNueva" 
                            value={userData.passwordNueva} 
                            onChange={handleChange} 
                            placeholder="Deja vacío si no quieres cambiarla"
                        />
                    </div>

                    {userData.passwordNueva && (
                        <div className="form-group-profile">
                            <label style={{color: '#d32f2f'}}>Contraseña Actual (Requerida para confirmar)</label>
                            <input 
                                type="password" 
                                name="passwordActual" 
                                value={userData.passwordActual} 
                                onChange={handleChange} 
                            />
                        </div>
                    )}
                </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
};

export default Perfil;