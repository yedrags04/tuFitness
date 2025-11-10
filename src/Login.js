import React from 'react';

function Login() {
  return (
    <div>
      <h2>Iniciar Sesión en TuFitness</h2>
      {/* Aquí irá el formulario de login */}
      <form>
        <input type="email" placeholder="Correo electrónico" required />
        <input type="password" placeholder="Contraseña" required />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;