import React from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Home.css'; 

function HomeContent() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      
      
      <section className="hero-section">
        <div className="hero-content">
          <h1>
            Tu Cuerpo <br />
            <span className="highlight">Tu Ritmo</span> <br />
            <span className="stroke-text">TuFitness</span>
          </h1>
          <p>
            Diseña, organiza y sigue tus entrenamientos de forma inteligente. 
            La herramienta definitiva para alcanzar tu mejor versión.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary-home" onClick={() => navigate('/rutinas')}>
              Ver mis Rutinas
            </button>
            <button className="btn-secondary-home" onClick={() => navigate('/rutinas')}>
              + Crear Nueva
            </button>
          </div>
        </div>
        
        <div className="hero-visual">
           <div className="circle-bg"></div>
           <span className="hero-emoji">🏋️‍♂️</span>
        </div>
      </section>

      
      <section className="features-section">
        <h2>¿Por qué elegir TuFitness?</h2>
        <div className="features-grid">
          
          <div className="feature-card">
            <div className="icon-box">📝</div>
            <h3>Personalización Total</h3>
            <p>Crea rutinas desde cero. Define días, ejercicios, series y pesos exactos a tu medida.</p>
          </div>

          <div className="feature-card">
            <div className="icon-box">📊</div>
            <h3>Organización Simple</h3>
            <p>Visualiza tu semana de entrenamiento con una interfaz limpia y fácil de entender.</p>
          </div>

          <div className="feature-card">
            <div className="icon-box">🚀</div>
            <h3>Progreso Real</h3>
            <p>Guarda tus récords, ajusta las cargas y no pierdas el foco de tus objetivos.</p>
          </div>

        </div>
      </section>

      
      <section className="cta-banner">
        <div className="cta-content">
            <h2>Empieza hoy mismo</h2>
            <p>No esperes al lunes. Tu transformación comienza ahora.</p>
            <button className="btn-outline-home" onClick={() => navigate('/rutinas')}>
              Ir al Panel Principal
            </button>
        </div>
      </section>

    </div>
  );
}

export default HomeContent;