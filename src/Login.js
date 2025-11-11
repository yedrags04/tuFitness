import React, { useState, useEffect, useRef } from 'react';
import './Login.css'; 
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { Link } from 'react-router-dom';
gsap.registerPlugin(Draggable, MorphSVGPlugin); // Registrar plugins


function Login() {
  // ----------------------------------------------------
  // 1. ESTADO Y REFERENCIAS (El modo React)
  // ----------------------------------------------------

  // Estado para saber si la lámpara está encendida
  const [isOn, setIsOn] = useState(false);

  // Referencias a los elementos del DOM que GSAP necesita tocar
  const lampRef = useRef(null);
  const loginFormRef = useRef(null);
  const onRadioRef = useRef(null);
  const offRadioRef = useRef(null);
  const eyeGroupRef = useRef(null);
  const cordsGroupRef = useRef(null);
  const cordDummyRef = useRef(null);
  
  // Referencias para la animación de la cuerda (simplificado)
  const hitRef = useRef(null); // El área invisible donde se hace clic

  // ----------------------------------------------------
  // 2. EFECTO DE SINCRONIZACIÓN (Cuando cambia 'isOn')
  // ----------------------------------------------------
  useEffect(() => {
    // Este efecto se ejecuta cada vez que el estado 'isOn' cambia.
    
    // Sincroniza la variable CSS '--on' que usa el CSS para los colores
    document.documentElement.style.setProperty('--on', isOn ? 1 : 0);

    // Muestra u oculta el formulario
    if (loginFormRef.current) {
      loginFormRef.current.classList.toggle('active', isOn);
    }
    
    // Actualiza los botones de radio (si existen)
    if (onRadioRef.current && offRadioRef.current) {
      onRadioRef.current.checked = isOn;
      offRadioRef.current.checked = !isOn;
    }

    // Cambia el color de la luz (como en el script original)
    if (isOn) {
      const hue = gsap.utils.random(0, 359);
      const glowColor = `hsl(${hue}, 40%, 45%)`;
      const glowColorDark = `hsl(${hue}, 40%, 35%)`;
      
      gsap.set(document.documentElement, {
        '--shade-hue': hue,
        '--glow-color': glowColor,
        '--glow-color-dark': glowColorDark,
      });
    }

    // Animar los ojos
    if (eyeGroupRef.current) {
      gsap.set(eyeGroupRef.current.children, {
        rotate: isOn ? 0 : 180,
      });
    }

  }, [isOn]); // 🔑 Dependencia: se ejecuta cuando 'isOn' cambia

  
  // ----------------------------------------------------
  // 3. EFECTO DE INICIALIZACIÓN (Solo se ejecuta 1 vez)
  // ----------------------------------------------------
  useEffect(() => {
    // 🔑 Hacer la lámpara visible (reemplaza el GSAP del script original)
    if (lampRef.current) {
        lampRef.current.style.display = 'block';
    }
    
    // Inicializar la rotación de los ojos
    if (eyeGroupRef.current) {
        gsap.set(eyeGroupRef.current.children, {
          rotate: 180,
          transformOrigin: "50% 50%",
          yPercent: 50,
        });
    }
    
    // Lógica de clic (simplificada, sin arrastrar)
    // Si tuvieras Draggable, aquí configurarías la animación completa.
    const hitArea = hitRef.current;
    
    const pullCord = () => {
        // AUDIO.CLICK.play(); // (Si quieres añadir audio)
        setIsOn(prevIsOn => !prevIsOn); // 🔑 Alterna el estado de React
    };

    if (hitArea) {
      hitArea.addEventListener('click', pullCord);
    }

    // 🔑 Limpieza: se ejecuta cuando el componente se "desmonta"
    return () => {
      if (hitArea) {
        hitArea.removeEventListener('click', pullCord);
      }
    };
  }, []); // 🔑 Array vacío: se ejecuta solo una vez al montar

  // ----------------------------------------------------
  // 4. RENDERIZADO (JSX)
  // ----------------------------------------------------
  return (
    <div className="login-page"> {/* 🔑 Contenedor con fondo oscuro */}
      <div className="container">

        {/* --- Formularios ocultos --- */}
        <form className="radio-controls">
          <input type="radio" id="on" name="status" value="on" ref={onRadioRef} readOnly />
          <label htmlFor="on">On</label>
          <input type="radio" id="off" name="status" value="off" ref={offRadioRef} readOnly />
          <label htmlFor="off">Off</label>
        </form>

        {/* --- SVG DE LA LÁMPARA (Convertido a JSX) --- */}
        <svg
          ref={lampRef} // 🔑 Referencia para el SVG principal
          className="lamp"
          viewBox="0 0 333 484"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ... (Pega aquí TODO el contenido del SVG: <g>, <path>, <defs>, etc.) ... */}
          {/* ... (Asegúrate de que 'class' sea 'className', 'for' sea 'htmlFor', y 'stroke-width' sea 'strokeWidth') ... */}
          
          <g className="lamp__shade shade">
            <ellipse className="shade__opening" cx="165" cy="220" rx="130" ry="20" />
            <ellipse className="shade__opening-shade" cx="165" cy="220" rx="130" ry="20" fill="url(#opening-shade)" />
          </g>
          <g className="lamp__base base">
            <path className="base__side" d="M165 464c44.183 0 80-8.954 80-20v-14h-22.869c-14.519-3.703-34.752-6-57.131-6-22.379 0-42.612 2.297-57.131 6H85v14c0 11.046 35.817 20 80 20z" />
            <path d="M165 464c44.183 0 80-8.954 80-20v-14h-22.869c-14.519-3.703-34.752-6-57.131-6-22.379 0-42.612 2.297-57.131 6H85v14c0 11.046 35.817 20 80 20z" fill="url(#side-shading)" />
            <ellipse className="base__top" cx="165" cy="430" rx="80" ry="20" />
            <ellipse cx="165" cy="430" rx="80" ry="20" fill="url(#base-shading)" />
          </g>
          <g className="lamp__post post">
            <path className="post__body" d="M180 142h-30v286c0 3.866 6.716 7 15 7 8.284 0 15-3.134 15-7V142z" />
            <path d="M180 142h-30v286c0 3.866 6.716 7 15 7 8.284 0 15-3.134 15-7V142z" fill="url(#post-shading)" />
          </g>
          <g className="lamp__cords cords" ref={cordsGroupRef}>
            <path className="cord cord--rig" d="M124 187.033V347" strokeWidth="6" strokeLinecap="round" />
            <path className="cord cord--rig" d="M124 187.023s17.007 21.921 17.007 34.846c0 12.925-11.338 23.231-17.007 34.846-5.669 11.615-17.007 21.921-17.007 34.846 0 12.925 17.007 34.846 17.007 34.846" strokeWidth="6" strokeLinecap="round" />
            <path className="cord cord--rig" d="M124 187.017s-21.259 17.932-21.259 30.26c0 12.327 14.173 20.173 21.259 30.26 7.086 10.086 21.259 17.933 21.259 30.26 0 12.327-21.259 30.26-21.259 30.26" strokeWidth="6" strokeLinecap="round" />
            <path className="cord cord--rig" d="M124 187s29.763 8.644 29.763 20.735-19.842 13.823-29.763 20.734c-9.921 6.912-29.763 8.644-29.763 20.735S124 269.939 124 269.939" strokeWidth="6" strokeLinecap="round" />
            <path className="cord cord--rig" d="M124 187.029s-10.63 26.199-10.63 39.992c0 13.794 7.087 26.661 10.63 39.992 3.543 13.331 10.63 26.198 10.63 39.992 0 13.793-10.63 39.992-10.63 39.992" strokeWidth="6" strokeLinecap="round" />
            <path className="cord cord--rig" d="M124 187.033V347" strokeWidth="6" strokeLinecap="round" />
            <line ref={cordDummyRef} className="cord cord--dummy" x1="124" y2="348" x2="124" y1="190" strokeWidth="6" strokeLinecap="round" />
          </g>
          <path className="lamp__light" d="M290.5 193H39L0 463.5c0 11.046 75.478 20 165.5 20s167-11.954 167-23l-42-267.5z" fill="url(#light)" />
          <g className="lamp__top top">
            <path className="top__body" fillRule="evenodd" clipRule="evenodd" d="M164.859 0c55.229 0 100 8.954 100 20l29.859 199.06C291.529 208.451 234.609 200 164.859 200S38.189 208.451 35 219.06L64.859 20c0-11.046 44.772-20 100-20z" />
            <path className="top__shading" fillRule="evenodd" clipRule="evenodd" d="M164.859 0c55.229 0 100 8.954 100 20l29.859 199.06C291.529 208.451 234.609 200 164.859 200S38.189 208.451 35 219.06L64.859 20c0-11.046 44.772-20 100-20z" fill="url(#top-shading)" />
          </g>
          <g className="lamp__face face">
            <g className="lamp__mouth">
              <path d="M165 178c19.882 0 36-16.118 36-36h-72c0 19.882 16.118 36 36 36z" fill="#141414" />
              <clipPath className="lamp__feature" id="mouth" x="129" y="142" width="72" height="36">
                <path d="M165 178c19.882 0 36-16.118 36-36h-72c0 19.882 16.118 36 36 36z" fill="#141414" />
              </clipPath>
              <g clipPath="url(#mouth)">
                <circle className="lamp__tongue" cx="179.4" cy="172.6" r="18" />
              </g>
            </g>
            <g className="lamp__eyes" ref={eyeGroupRef}>
              <path className="lamp__eye lamp__stroke" d="M115 135c0-5.523-5.82-10-13-10s-13 4.477-13 10" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path className="lamp__eye lamp__stroke" d="M241 135c0-5.523-5.82-10-13-10s-13 4.477-13 10" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
          
          <defs>
            <linearGradient id="opening-shade" x1="35" y1="220" x2="295" y2="220" gradientUnits="userSpaceOnUse">
              <stop />
              <stop offset="1" stopColor="var(--shade)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="base-shading" x1="85" y1="444" x2="245" y2="444" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--b-1)" />
              <stop offset="0.8" stopColor="var(--b-2)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="side-shading" x1="119" y1="430" x2="245" y2="430" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--b-3)" />
              <stop offset="1" stopColor="var(--b-4)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="post-shading" x1="150" y1="288" x2="180" y2="288" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--b-1)" />
              <stop offset="1" stopColor="var(--b-2)" stopOpacity="0"CSS
              />
            </linearGradient>
            <linearGradient id="light" x1="165.5" y1="218.5" x2="165.5" y2="483.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--l-1)" stopOpacity=".2" />
              <stop offset="1" stopColor="var(--l-2)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="top-shading" x1="56" y1="110" x2="295" y2="110" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--t-1)" stopOpacity=".8" />
              <stop offset="1" stopColor="var(--t-2)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 🔑 Área de Clic (onClick ahora es manejado por React) */}
          <circle
            ref={hitRef}
            className="lamp__hit"
            cx="124"
            cy="347"
            r="66"
            fill="#C4C4C4"
            fillOpacity=".1"
          />
        </svg>

        {/* --- Formulario de Login --- */}
        <div ref={loginFormRef} className="login-form"> {/* 🔑 Referencia para el formulario */}
          <h2>Welcome Back</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit" className="login-btn">Login</button>
            <div className="form-footer">
              <a href="#" className="forgot-link">Forgot Password?</a>
            </div>
            <div className="form-footer">
              <Link to="/registrarse" className="forgot-link">
                ¿No tienes cuenta? Regístrate
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;