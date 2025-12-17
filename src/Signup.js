import React, { useState } from 'react';
import './css/Login.css'; // Usamos el mismo CSS del login
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Cuestionario() {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({ 
        username: '', 
        email: '', 
        contrasena: '', 
        genero: null,   
        anioNacimiento: '', 
        estatura: '',       
        peso: ''            
    });
    
    const [errorMsg, setErrorMsg] = useState(""); 
    
    const handleChange = (e) => {
        let value = e.target.value;

        // Manejo especial para el género
        if (e.target.name === 'genero') { // Cambié a e.target.name para radios
            value = (value === 'true');
        }

        const id = e.target.id || e.target.name; // Fallback para radios

        if (['anioNacimiento', 'estatura', 'peso'].includes(id)) {
            value = value ? parseFloat(value) : ''; 
        }

        setFormData({ ...formData, [id]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(""); 

        if (!formData.username || !formData.email || !formData.contrasena || formData.genero === null) {
             setErrorMsg("Rellena los campos obligatorios (*).");
             return;
        }

        if (formData.contrasena.length < 6) {
             setErrorMsg("Contraseña mín. 6 caracteres.");
             return;
        }

        try {
            const res = await axios.post("http://localhost:5000/api/auth/register", {
                username: formData.username,
                email: formData.email,
                contrasena: formData.contrasena, 
                genero: formData.genero,
                anioNacimiento: formData.anioNacimiento || null, 
                estatura: formData.estatura || null,
                peso: formData.peso || null,
            });
            
            if (res.status === 201) {
                alert("¡Cuenta creada! Inicia sesión.");
                navigate("/iniciar-sesion"); 
            }
        } catch (err) {
            console.error("Error registro:", err);
            if (err.response && err.response.data && err.response.data.msg) {
                setErrorMsg(err.response.data.msg); 
            } else if (err.response && err.response.data.errors) {
                setErrorMsg("Error: " + err.response.data.errors[0].message);
            } else {
                setErrorMsg("Error del servidor.");
            }
        }
    };

    return (
        <div className="login-page">
             <div className="ring ring-large">
                <i style={{'--clr': '#5C6B73'}}></i>
                <i style={{'--clr': '#C2DFE3'}}></i>
                <i style={{'--clr': '#9DB4C0'}}></i>
                
                {/* CAMBIO AQUÍ: Quitamos el style={{width: '400px'}} porque ahora lo maneja el CSS */}
                <div className="login"> 
                    <h2>Registro</h2>
                    
                    <form onSubmit={handleSubmit} style={{width: '100%'}}>
                        
                        {/* Contenedor con scroll para que quepan todos los inputs */}
                        <div className="signup-scroll-container">
                            
                            <div className="inputBx">
                                <input type="text" id="username" placeholder="Usuario *" value={formData.username} onChange={handleChange} required />
                            </div>

                            <div className="inputBx">
                                <input type="email" id="email" placeholder="Email *" value={formData.email} onChange={handleChange} required />
                            </div>

                            <div className="inputBx">
                                <input type="password" id="contrasena" placeholder="Contraseña *" value={formData.contrasena} onChange={handleChange} required />
                            </div>

                            {/* Género */}
                            <div className="radio-group-styled">
                                <label>
                                    <input type="radio" name="genero" value="true" onChange={handleChange} required /> Masc.
                                </label>
                                <label>
                                    <input type="radio" name="genero" value="false" onChange={handleChange} required /> Fem.
                                </label>
                            </div>

                            <div className="row-inputs">
                                <div className="inputBx">
                                    <input type="number" id="anioNacimiento" placeholder="Año Nac." value={formData.anioNacimiento} onChange={handleChange} />
                                </div>
                                <div className="inputBx">
                                    <input type="number" id="estatura" placeholder="Altura (cm)" step="0.01" value={formData.estatura} onChange={handleChange} />
                                </div>
                            </div>
                            
                            <div className="inputBx">
                                <input type="number" id="peso" placeholder="Peso (kg)" step="0.1" value={formData.peso} onChange={handleChange} />
                            </div>
                        </div>

                        {errorMsg && <p style={{color: '#ff0057', textAlign: 'center', fontSize: '0.9rem', marginTop: '10px'}}>{errorMsg}</p>}

                        <div className="inputBx" style={{marginTop: '20px'}}>
                            <input type="submit" value="Registrarse" />
                        </div>

                        <div className="links" style={{justifyContent: 'center', marginTop: '10px'}}>
                            <Link to="/iniciar-sesion">¿Ya tienes cuenta? Entrar</Link>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default Cuestionario;