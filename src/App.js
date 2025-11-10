import logo from './logo.svg';
import './App.css';
import Header from './Header'; 
import Footer from './Footer'; 
import { Routes, Route } from 'react-router-dom';
import HomeContent from './HomeContent';
import Login from './Login';

function App() {
  return (
    <div className="App">
      <Header /> 
      <main>
        <p>
          En tu TuFitness queremos ayudar a todo tipo de personas a empezar con el deporte, 
          de una forma sana en la que se compare con ella misma y no con las demas personas.
          Ya que entre otras muchas funciones de ofrece una estadistica del proceso que se ha 
          ido teniendo.
        </p>
        {/*PREDUNTAR A PABLO SI METER VIDEOS AQUI O METER OTRA COSA*/}
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