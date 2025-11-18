import React, { useState, useEffect, useRef } from 'react';
import logo from './img/logo192.png'; 
import { Link } from 'react-router-dom';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() =>{
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const closeMenu = () => {
    setIsOpen(false);
  };
  return (
    <header className="App-main-header">
      
      <div className="header-left-group">
        <nav className="dropdown-container" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="dropdown-trigger"
          >
            ☰
          </button>
          <div className={`dropdown-menu ${isOpen ? 'active' : ''}`}>
            <Link to="/" className="dropdown-link" onClick={closeMenu}>
              Inicio
            </Link>
            <Link to="/rutinas" className="dropdown-link" onClick={closeMenu}>
              Rutinas
            </Link>
            <Link to="/registrarse" className="dropdown-link" onClick={closeMenu}>
              Registrarse
            </Link>
          </div>
        </nav>
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