import React from 'react';
// Si usas el logo.svg, impórtalo:
import logo from './logo.svg'; 

function Header() {
  const navigateToLogin = () => {
    window.location.href = '/Login.js';
  }
  return (
    <header className="App-main-header">
      {/* Grupo Izquierda: Logo y Nombre */}
      <div className="header-left-group">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>TuFitness</h1>
      </div>
      
      <nav> 
        <Link to="/iniciar-sesion" className="login-button">
          Iniciar Sesión
        </Link>
      </nav>
    </header>
  );
}

export default Header;