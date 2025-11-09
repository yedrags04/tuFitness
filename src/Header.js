import React from 'react';
// Si usas el logo.svg, impórtalo:
import logo from './logo.svg'; 

function Header() {
  return (
    <header className="App-header">
      {/* Puedes añadir tu logo aquí */}
      <img src={logo} className="App-logo" alt="logo" />
      <h1>TuFitness</h1>
      {/* Aquí podrías añadir un menú de navegación */}
    </header>
  );
}

export default Header;