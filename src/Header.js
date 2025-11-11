import React from 'react';
import logo from './logo.svg'; 
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="App-main-header">
      
      <div className="header-left-group">
        <Link to="/">
          <img src={logo} className="App-logo" alt="logo" />
        </Link>
        <h1>TuFitness</h1>
      </div>
      
      <nav>
        <Link to="/iniciar-sesion" className="login-button">
          INICIAR SESIÓN
        </Link>
      </nav>
    </header>
  );
}

export default Header;