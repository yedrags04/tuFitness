import React from 'react';
import './Rutinas.css';

function Rutinas() {
  return (
    <div>
        <h2>Aqui encontraras todas tus rutinas y rutinas predeteminadas</h2>
        <div class = "mis_rutinas">
            <p>Mis Rutinas</p>
            <div class = "rutina_cliente">
                <h3>Rutina 1</h3>
                <h5>Rutina enfocada en <b>CULO</b></h5>
                <p>3 días a la semana, 2 horas por dia</p>
                <button>VER</button>
                <button>EDITAR</button>
            </div>
            <div class = "rutina_cliente">
                <h3>Rutina 2</h3>
                <h5>Rutina enfocada en <b>ESPALDA</b></h5>
                <p>4 días a la semana, 1 horas por dia</p>
                <button>VER</button>
                <button>EDITAR</button>
            </div>
            <div class = "rutina_cliente">
                <h3>Rutina 3</h3>
                <h5>Rutina enfocada en <b>HOMBRO</b></h5>
                <p>5 días a la semana, 3 horas por dia</p>
                <button>VER</button>
                <button>EDITAR</button>
            </div>
        </div>

        

        <div class = "rutinas_pre">
            <p>Rutinas predeterminadas</p>
            <div class = "ritinita_pre">
                <h3>CULO</h3>
                <h5>Rutina enfocada en <b>GLUTEO E ISQUIOS</b></h5>
                <p>5 días a la semana, 2 horas por dia</p>
                <button>VER</button>
            </div>
            <div class = "ritinita_pre">
                <h3>HOMBRO, PECHO, TRICEPS</h3>
                <h5>Rutina enfocada en <b>HOMBRO, PECHO</b></h5>
                <p>5 días a la semana, 2 horas por dia</p>
                <button>VER</button>
            </div>
            <div class = "ritinita_pre">
                <h3>ESPALDA, BICEPS</h3>
                <h5>Rutina enfocada en <b>ESPALDA</b></h5>
                <p>5 días a la semana, 2 horas por dia</p>
                <button>VER</button>
            </div>
            <div class = "ritinita_pre">
                <h3>PIERNA</h3>
                <h5>Rutina enfocada en <b>CUADRICEPS Y GEMELOS</b></h5>
                <p>5 días a la semana, 2 horas por dia</p>
                <button>VER</button>
            </div>
        </div>

    </div>
  );
}

export default Rutinas;