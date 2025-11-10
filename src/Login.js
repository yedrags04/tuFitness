import React from 'react';

function Login() {
  const navigateToLogin = () => {
    window.location.href = '/Login.js';
  }
  return (
    <header className="App-main-header">
      {/* Grupo Izquierda: Logo y Nombre */}
      <div className="header-left-group">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>jhsioff</h1>
      </div>
      
      <nav> 
        <button className="login-button" onClick={navigateToLogin}>
          IPatata
        </button>
      </nav>
    </header>
  );
}

export default Header;