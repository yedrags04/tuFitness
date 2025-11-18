import React from 'react';
import './css/Rutinas.css';
import { Link } from 'react-router-dom';

function Rutinas() {
  return (
    
    <div className="rutinas-page">
        <h2>Aquí encontrarás todas tus rutinas y rutinas predeterminadas</h2>
        <div className="mis_rutinas">
            <p>Mis Rutinas</p>
            <div className="rutina_cliente">
                <h3>Rutina 1</h3>
                <h5>Rutina enfocada en <b>CULO</b></h5>
                <p>3 días a la semana, 2 horas por día</p>
                <button>VER</button>
                <Link to="/EditarRutina" className="Editar">
                    EDITAR
                </Link>
            </div>
            <div className="rutina_cliente">
                <h3>Rutina 2</h3>
                <h5>Rutina enfocada en <b>ESPALDA</b></h5>
                <p>4 días a la semana, 1 horas por día</p>
                <button>VER</button>
                <Link to="/EditarRutina" className="Editar">
                    EDITAR
                </Link>
            </div>
            <div className="rutina_cliente">
                <h3>Rutina 3</h3>
                <h5>Rutina enfocada en <b>HOMBRO</b></h5>
                <p>5 días a la semana, 3 horas por día</p>
                <button>VER</button>
                <Link to="/EditarRutina" className="Editar">
                    EDITAR
                </Link>
            </div>
        </div>

        

        <div className="rutinas_pre">
            <p>Rutinas predeterminadas</p>
            <div className="ritinita_pre">
                <h3>CULO</h3>
                <h5>Rutina enfocada en <b>GLUTEO E ISQUIOS</b></h5>
                <p>5 días a la semana, 2 horas por día</p>
                <button>VER</button>
            </div>
            <div className="ritinita_pre">
                <h3>HOMBRO, PECHO, TRICEPS</h3>
                <h5>Rutina enfocada en <b>HOMBRO, PECHO</b></h5>
                <p>5 días a la semana, 2 horas por día</p>
                <button>VER</button>
            </div>
            <div className="ritinita_pre">
                <h3>ESPALDA, BÍCEPS</h3>
                <h5>Rutina enfocada en <b>ESPALDA</b></h5>
                <p>5 días a la semana, 2 horas por día</p>
                <button>VER</button>
            </div>
            <div className="ritinita_pre">
                <h3>PIERNA</h3>
                <h5>Rutina enfocada en <b>CUÁDRICEPS Y GEMELOS</b></h5>
                <p>5 días a la semana, 2 horas por día</p>
                <button>VER</button>
            </div>
        </div>

    </div>
  );
}

export default Rutinas;