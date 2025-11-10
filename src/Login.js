import React from 'react';

function Login() {
  return (
    <div>
      <h2>Iniciar Sesión en TuFitness</h2>
      {/* Tu formulario de login va aquí */}
      <form>
        <label htmlFor="email">Correo:</label>
        <input id="email" type="email" placeholder="tucorreo@ejemplo.com" required />
        
        <label htmlFor="password">Contraseña:</label>
        <input id="password" type="password" placeholder="********" required />
        
        <button type="submit" className="login-button">Entrar</button>
      </form>
      <p>¿No tienes cuenta? Regístrate aquí.</p>
    </div>
  );
}

export default Login;