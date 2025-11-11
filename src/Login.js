import React, { useState, useEffect } from 'react';
import './Login.css';
import { gsap, set } from 'gsap'; 

function Login() {
  
  const [isOn, setIsOn] = useState(false);
  const toggleLamp = () => {
    setIsOn(prev => !prev);
  };
  useEffect(() => {
    document.documentElement.style.setProperty('--on', isOn ? 1 : 0);
    if (isOn) {
      const newHue = 320; 
      const glowColor = `hsl(${newHue}, 40%, 45%)`;
      const glowColorDark = `hsl(${newHue}, 40%, 35%)`;
      
      document.documentElement.style.setProperty('--shade-hue', newHue);
      document.documentElement.style.setProperty('--glow-color', glowColor);
      document.documentElement.style.setProperty('--glow-color-dark', glowColorDark);
    }
    
    // Aquí iría la lógica compleja de GSAP si la implementas,
    // incluyendo la inicialización del MorphSVGPlugin y Draggable.
    // Recuerda que deberías hacer la limpieza de Draggable en el return de useEffect.
    
  }, [isOn]); // Se ejecuta cada vez que 'isOn' cambia

 
  return (
    <div className="login-page">
      <div className="container">
          
        {/* El formulario de control de radiobuttons del demo original (oculto en CSS) */}
        <form className="radio-controls">
            {/* El estado 'isOn' de React controla si el radio 'on' está marcado */}
            <input type="radio" id="on" name="status" value="on" readOnly checked={isOn} />
            <label htmlFor="on">On</label>
            <input type="radio" id="off" name="status" value="off" readOnly checked={!isOn} />
            <label htmlFor="off">Off</label>
        </form>

        {/* 🔑 La etiqueta SVG (se convierte a JSX) */}
        <svg
          className="lamp"
          viewBox="0 0 333 484"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g className="lamp__shade shade">
            <ellipse
              className="shade__opening"
              cx="165"
              cy="220"
              rx="130"
              ry="20"
            />
            <ellipse
              className="shade__opening-shade"
              cx="165"
              cy="220"
              rx="130"
              ry="20"
              fill="url(#opening-shade)"
            />
          </g>
          {/* ... (El resto del SVG omitido por espacio, pero debes pegarlo aquí) ... */}
          
          {/* 🔑 Área de 'hit' para hacer clic y alternar el estado */}
          <circle
            className="lamp__hit"
            cx="124"
            cy="347"
            r="66"
            fill="#C4C4C4"
            fillOpacity=".1" // Propiedades con guiones se convierten a camelCase
            onClick={toggleLamp} // 🔑 Usar el handler de React
          />
        </svg>
        
        {/* 🔑 El formulario de login, con la clase dinámica */}
        <div className={`login-form ${isOn ? 'active' : ''}`}>
          <h2>Iniciar Sesión</h2>
          <form onSubmit={(e) => e.preventDefault()}> {/* 🔑 Usar onSubmit con e.preventDefault() */}
              <div className="form-group">
                  <label htmlFor="username">Usuario</label>
                  <input
                      type="text"
                      id="username"
                      placeholder="Introduce tu usuario"
                      required
                  />
              </div>
              <div className="form-group">
                  <label htmlFor="password">Contraseña</label>
                  <input
                      type="password"
                      id="password"
                      placeholder="Introduce tu contraseña"
                      required
                  />
              </div>
              <button type="submit" className="login-btn">Entrar</button>
              <div className="form-footer">
                  <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
              </div>
          </form>
        </div>
        
      </div>
    </div>
  );
}

export default Login;