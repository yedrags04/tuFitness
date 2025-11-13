import './App.css';
import { Routes, Route } from 'react-router-dom'; 
import Header from './Header'; 
import Footer from './Footer'; 
import Login from './Login';
import Singup from './Singup';
import HomeContent from './HomeContent'; 
import Rutinas from './Rutinas';

function App() {
  return (
    <div className="App">
      
      <Header />
      
      <main>
        <Routes>
          <Route path="/" element={<HomeContent />} /> 
          <Route path="/iniciar-sesion" element={<Login />} />
          <Route path="/registrarse" element={<Singup />} /> 
          <Route path="/rutinas" element={<Rutinas />} />
        </Routes>
      </main>
      
      <Footer />
      
    </div>
  );
}

export default App;