import './css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header'; 
import Footer from './Footer'; 
import Login from './Login';
import Signup from './Signup';
import HomeContent from './HomeContent'; 
import Rutinas from './Rutinas';
import EditarRutina from './EditarRutina';
import Perfil from './Perfil'; 

function App() {
  const user = localStorage.getItem("user");

  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomeContent />} /> 
          
          <Route path="/iniciar-sesion" element={user ? <Navigate to="/rutinas" /> : <Login />} />
          <Route path="/registrarse" element={user ? <Navigate to="/rutinas" /> : <Signup />} /> 
          
          <Route 
            path="/rutinas" 
            element={user ? <Rutinas /> : <Navigate to="/iniciar-sesion" />} 
          />
          
          <Route 
            path="/EditarRutina" 
            element={user ? <EditarRutina /> : <Navigate to="/iniciar-sesion" />} 
          />

          <Route 
            path="/perfil" 
            element={user ? <Perfil /> : <Navigate to="/iniciar-sesion" />} 
          />

        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;