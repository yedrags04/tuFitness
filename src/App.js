import './App.css';
import { Routes, Route } from 'react-router-dom'; 
import Header from './Header'; 
import Footer from './Footer'; 
import Login from './Login';
import HomeContent from './HomeContent'; 

function App() {
  return (
    <div className="App">
      
      <Header />
      
      <main>
        <Routes>
          <Route path="/" element={<HomeContent />} /> 
          <Route path="/iniciar-sesion" element={<Login />} /> 
        </Routes>
      </main>
      
      <Footer />
      
    </div>
  );
}

export default App;