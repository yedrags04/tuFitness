import React, { useState, useEffect, useRef } from 'react';
import logo from './img/logo192.png'; 
import { Link, useNavigate } from 'react-router-dom'; // Importamos useNavigate

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null); // 1. Estado para saber si hay usuario
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Al cargar el Header, revisamos si hay sesión guardada
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Tu lógica del menú dropdown
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

  // 2. Función para Cerrar Sesión
  const handleLogout = () => {
    localStorage.removeItem("user");  // Borrar usuario
    localStorage.removeItem("token"); // Borrar token
    setUser(null);                    // Limpiar estado local
    setIsOpen(false);                 // Cerrar menú si está abierto
    
    // Redirigir al inicio y recargar para limpiar cualquier dato en memoria
    window.location.href = "/"; 
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
            
            {/* Solo mostramos enlace a Rutinas si está logueado */}
            {user && (
                <Link to="/rutinas" className="dropdown-link" onClick={closeMenu}>
                Rutinas
                </Link>
            )}
            
            {/* Solo mostramos Registrarse si NO está logueado */}
            {!user && (
                <Link to="/registrarse" className="dropdown-link" onClick={closeMenu}>
                Registrarse
                </Link>
            )}
          </div>
        </nav>
        <Link to="/">
          <img src={logo} className="App-logo" alt="logo" />
        </Link>
        <h1>TuFitness</h1>
      </div>
      
      <nav>
        {/* 3. Renderizado Condicional del Botón */}
        {user ? (
            // Si hay usuario -> Botón de Cerrar Sesión
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px'}}>
                {/* Opcional: Mostrar nombre del usuario */}
                <span style={{ color: 'white', fontSize: '14px', marginRight: '10px', display: window.innerWidth > 600 ? 'block' : 'none' }}>
                    Hola, {user.username}
                </span>
                <button 
                    onClick={handleLogout} 
                    className="login-button"
                    style={{ cursor: 'pointer', fontSize: '1rem' }} // Asegurar que parezca clickeable
                >
                    CERRAR SESIÓN
                </button>
            </div>
        ) : (
            // Si NO hay usuario -> Botón de Iniciar Sesión
            <Link to="/iniciar-sesion" className="login-button">
                INICIAR SESIÓN
            </Link>
        )}
      </nav>
    </header>
  );
}

export default Header;