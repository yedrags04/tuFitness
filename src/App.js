import './App.css';
// 🔑 Importar Routes y Route
import { Routes, Route } from 'react-router-dom'; 
// Asumo que tienes los componentes Header y Footer
import Header from './Header'; 
import Footer from './Footer'; 
// 🔑 Importar los nuevos componentes
import Login from './Login';
import HomeContent from './HomeContent'; 

function App() {
  return (
    <div className="App">
      
      <Header />
      
      <main>
        {/* 🔑 El Routes decide qué componente mostrar */}
        <Routes>
          {/* Ruta para la página principal: '/' */}
          <Route path="/" element={<HomeContent />} /> 
          
          {/* Ruta para la página de Login: '/iniciar-sesion' */}
          <Route path="/iniciar-sesion" element={<Login />} /> 
        </Routes>
      </main>
      
      <Footer />
      
    </div>
  );
}

export default App;