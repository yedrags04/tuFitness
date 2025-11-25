import React, {useState, useEffect, useRef } from 'react';
import './css/Login.css'; 
import { gsap } from 'gsap'; 
import { Link, } from 'react-router-dom';
import axios from 'axios'; // Importante para la conexión API

//Asegúrate de importar y registrar los plugins GSAP si los estás usando
import { Draggable } from 'gsap/Draggable';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
gsap.registerPlugin(Draggable, MorphSVGPlugin); 

function Login() {
  //const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ 
    username: '', 
    password: '' 
  });
  const [error, setError] = useState(false);

  // --- Lógica de Manejo de Estado y API ---
  
  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(false);

    try {
      const res = await axios.post("http://localhost:42311/api/auth/login", credentials);
      
      // --- CORRECCIÓN AQUÍ ---
      // Tu backend envía un objeto que contiene "user" y "token" por separado.
      const { user, token } = res.data; 
      
      // Guardamos el objeto user limpio y el token
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token); 
      
      // 3. Redirige a la página principal
      window.location.replace("/rutinas"); 

    } catch (err) {
      setError(true);
      console.error("Error de Login:", err);
    }
  };

  // --- Lógica GSAP/UI (Mantenemos tu código original de la lámpara) ---
  const [isOn, setIsOn] = useState(false);
  const toggleLamp = () => { setIsOn(prev => !prev); };
  const lampRef = useRef(null);
  const loginFormRef = useRef(null);
  const onRadioRef = useRef(null);
  const offRadioRef = useRef(null);
  const eyeGroupRef = useRef(null);
  const hitRef = useRef(null); 
  const cordsGroupRef = useRef(null);
  const cordDummyRef = useRef(null);

  useEffect(() => {
    document.documentElement.style.setProperty('--on', isOn ? 1 : 0);
    if (loginFormRef.current) {
      loginFormRef.current.classList.toggle('active', isOn);
    }
    if (onRadioRef.current && offRadioRef.current) {
      onRadioRef.current.checked = isOn;
      offRadioRef.current.checked = !isOn;
    }
    if (isOn) {
      const hue = gsap.utils.random(0, 359);
      const glowColor = `hsl(${hue}, 40%, 45%)`;
      const glowColorDark = `hsl(${hue}, 40%, 35%)`;
      gsap.set(document.documentElement, {
        '--shade-hue': hue, '--glow-color': glowColor, '--glow-color-dark': glowColorDark,
      });
    }
    if (eyeGroupRef.current) {
      gsap.set(eyeGroupRef.current.children, {
        rotate: isOn ? 0 : 180,
      });
    }
  }, [isOn]);

  useEffect(() => {
    document.body.style.backgroundColor = '#121921'; 
    document.body.style.minHeight = '100vh'; 

    if (lampRef.current) {
        lampRef.current.style.display = 'block';
    }
    
    if (eyeGroupRef.current) {
        gsap.set(eyeGroupRef.current.children, {
          rotate: 180,
          transformOrigin: "50% 50%",
          yPercent: 50,
        });
    }
   
    return () => {
      document.body.style.backgroundColor = ''; 
      document.body.style.minHeight = '';
    };
  }, []);
  // --- Fin Lógica GSAP/UI ---

  return (
    <div className="login-page"> 
      <div className="container">

        {/* ... Código SVG/Lámpara (omito por brevedad) ... */}
        {/* ... */}
        <svg
          ref={lampRef} 
          className="lamp"
          viewBox="0 0 333 484"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
        {/* ... Contenido del SVG ... */}
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
          
          <defs>{/* ... definiciones ... */}</defs>

          <g 
            ref={hitRef} 
            onClick={toggleLamp} 
            style={{ cursor: 'pointer' }}
          >
            <circle
              className="pull-knob"
              cx="124"
              cy="347"
              r="10" 
              fill="var(--glow-color)" 
            />
            <circle
              className="lamp__hit"
              cx="124"
              cy="347"
              r="66"
              fill="transparent"
            />
          </g>
        </svg>

        <div ref={loginFormRef} className="login-form"> 
          <h2>Bienvenido</h2>
          
          {/* Aquí asignamos la función de manejo de login */}
          <form onSubmit={handleLogin}> 
            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <input
                type="text"
                id="username"
                placeholder="Introduzca su usuario"
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                placeholder="Introduzca su contraseña"
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="login-btn">Iniciar sesión</button>
            
            {/* Mensaje de error visible solo si hubo un error */}
            {error && <p style={{color: 'red', marginTop: '10px'}}>Usuario o contraseña incorrectos.</p>}
            
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