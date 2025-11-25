import './css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom'; // Importamos Navigate
import Header from './Header'; 
import Footer from './Footer'; 
import Login from './Login';
import Signup from './Signup';
import HomeContent from './HomeContent'; 
import Rutinas from './Rutinas';
import EditarRutina from './EditarRutina'
//import { useState } from 'react';

function App() {
  // Verificamos si hay un usuario guardado en localStorage
  const user = localStorage.getItem("user");

  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomeContent />} /> 
          
          {/* Si ya hay usuario, redirige a Rutinas, si no, muestra Login */}
          <Route path="/iniciar-sesion" element={user ? <Navigate to="/rutinas" /> : <Login />} />
          <Route path="/registrarse" element={user ? <Navigate to="/rutinas" /> : <Signup />} /> 
          
          {/* RUTAS PROTEGIDAS: Si no hay usuario, redirige a Login */}
          <Route 
            path="/rutinas" 
            element={user ? <Rutinas /> : <Navigate to="/iniciar-sesion" />} 
          />
          <Route 
            path="/EditarRutina" 
            element={user ? <EditarRutina /> : <Navigate to="/iniciar-sesion" />} 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;