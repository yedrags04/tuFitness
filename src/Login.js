import React, { useState } from 'react';
import './css/Login.css'; 
import { Link } from 'react-router-dom';
import axios from 'axios'; 

function Login() {
  const [credentials, setCredentials] = useState({ 
    username: '', 
    contrasena: '' 
  });
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(false);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", credentials);
      const { user, token } = res.data; 
      
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token); 
      
      window.location.replace("/rutinas"); 

    } catch (err) {
      setError(true);
      console.error("Error de Login:", err.response ? err.response.data : err.message);
    }
  };

  return (
    <div className="login-page"> 
      
      
      <div className="ring">
        
        <i style={{'--clr': '#253237'}}></i>
        <i style={{'--clr': '#5C6B73'}}></i>
        <i style={{'--clr': '#9DB4C0'}}></i>
        
        <div className="login">
          <h2>Iniciar Sesión</h2>
          
          
          <form style={{width: '100%', display: 'flex', flexDirection: 'column', gap: '20px'}} onSubmit={handleLogin}>
            
            <div className="inputBx">
              <input 
                type="text" 
                id="username"
                placeholder="Usuario" 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="inputBx">
              <input 
                type="password" 
                id="contrasena"
                placeholder="Contraseña" 
                onChange={handleChange}
                required
              />
            </div>

            {error && <p style={{color: '#e63946', textAlign: 'center', fontWeight: 'bold', margin: 0}}>Credenciales incorrectas</p>}

            <div className="inputBx">
              <input type="submit" value="Entrar" />
            </div>

            <div className="links">
              <Link to="#">¿Olvidaste contraseña?</Link>
              <Link to="/registrarse">Registrarse</Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;