import React from 'react';
import logo from './logo.svg'; 
import { Link } from 'react-router-dom'; // 🔑 Importar Link

function Header() {
  return (
    <header className="App-main-header">
      
      <div className="header-left-group">
        {/* Usar Link para navegar a la ruta principal cuando se hace clic en el logo */}
        <Link to="/">
          <img src={logo} className="App-logo" alt="logo" />
        </Link>
        <h1>TuFitness</h1>
      </div>
      
      <nav>
        {/* Usar Link para navegar a la ruta de login */}
        <Link to="/iniciar-sesion" className="login-button">
          Iniciar Sesión
        </Link>
      </nav>
    </header>
  );
}

export default Header;