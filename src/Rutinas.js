import React, { useEffect, useState } from 'react';
import './css/Rutinas.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Rutinas() {
  const [rutinas, setRutinas] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/routines", {
          headers: { token: `Bearer ${token}` } // Enviamos el token para permiso
        });
        setRutinas(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchRutinas();
  }, [token]);

  return (
    <div className="rutinas-page">
        <h2>Hola {user.username}, aquí están tus rutinas</h2>
        
        <div className="mis_rutinas">
            <p>Mis Rutinas y Predeterminadas</p>
            {rutinas.map((rutina) => (
                <div className={rutina.isDefault ? "ritinita_pre" : "rutina_cliente"} key={rutina._id}>
                    <h3>{rutina.name}</h3>
                    <h5>Enfoque: <b>{rutina.focus}</b></h5>
                    <p>{rutina.daysPerWeek} días/sem, {rutina.duration}h</p>
                    <button>VER</button>
                    {/* Solo mostrar botón editar si NO es predeterminada */}
                    {!rutina.isDefault && (
                        <Link to={`/EditarRutina?id=${rutina._id}`} className="Editar">
                            EDITAR
                        </Link>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
}

export default Rutinas;