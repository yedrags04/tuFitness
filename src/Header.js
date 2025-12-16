import React, { useState, useEffect, useRef } from 'react';
import logo from './img/logo192.png'; 
import { Link } from 'react-router-dom'; 

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

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

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setIsOpen(false);
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
            
            {user && (
              <>
                <Link to="/rutinas" className="dropdown-link" onClick={closeMenu}>
                  Rutinas
                </Link>
                <Link to="/perfil" className="dropdown-link" onClick={closeMenu}>
                  Mi Perfil
                </Link>
              </>
            )}
            
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
        {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px'}}>
                
                <Link 
                  to="/perfil" 
                  style={{ 
                    textDecoration: 'none', 
                    color: 'white', 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    display: window.innerWidth > 600 ? 'flex' : 'none',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  title="Ir a mi perfil"
                >
                    <span>Hola, {user.username}</span>
                    {/* Un pequeño icono de usuario opcional */}
                    <span style={{fontSize: '1.2rem'}}>👤</span>
                </Link>

                <button 
                    onClick={handleLogout} 
                    className="login-button"
                    style={{ cursor: 'pointer', fontSize: '0.9rem' }} 
                >
                    CERRAR SESIÓN
                </button>
            </div>
        ) : (
            <Link to="/iniciar-sesion" className="login-button">
                INICIAR SESIÓN
            </Link>
        )}
      </nav>
    </header>
  );
}

export default Header;