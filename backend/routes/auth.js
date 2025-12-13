// backend/routes/auth.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../db/sequelize'); 

// REGISTRO (/api/auth/register)
router.post('/register', async (req, res) => {
  const { username, 
    email, 
    contrasena, // La contraseña
    genero,  
    anioNacimiento, 
    estatura, 
    peso 
  } = req.body;
  
  console.log("📩 [REGISTER] Datos recibidos:", { username, email }); // Log 1

  if (!contrasena) {
    console.error("❌ [REGISTER] Falta el campo 'contrasena' en req.body.");
    return res.status(400).json({ msg: "La contraseña es un campo obligatorio." });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    const newUser = await User.create({
      username,
      email,
      contrasena: hashedPassword,
      genero, 
      anioNacimiento,
      estatura,
      peso,
    });

    console.log("✅ [REGISTER] Usuario creado con ID:", newUser.id); // Log 2
    res.status(201).json({ msg: "Usuario registrado con éxito" });
  } catch (err) {
    console.error("❌ [REGISTER] Error:", err); // Log 3: Ver error real

    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ msg: "El nombre de usuario o email ya están en uso." });
    }
    res.status(500).send('Error del servidor: ' + err.message);
  }
});

// LOGIN (/api/auth/login)
router.post('/login', async (req, res) => {
  const { username, password } = req.body; 
  
  // 1. Ver qué llega del Frontend
  console.log("--------------------------------------------------");
  console.log("🔑 [LOGIN] Intento de acceso para:", username);
  console.log("🔑 [LOGIN] Contraseña enviada:", password); 

  try {
    // 2. Buscar usuario en la BD
    const user = await User.findOne({ where: { username } }); 
    
    if (!user) {
      console.log("⛔ [LOGIN] Usuario NO encontrado en la base de datos.");
      return res.status(404).json("Usuario no encontrado");
    }

    console.log("✅ [LOGIN] Usuario encontrado en BD. ID:", user.id);
    console.log("🔐 [LOGIN] Hash almacenado:", user.password); // Ver el hash guardado

    // 3. Comparar contraseñas
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      console.log("⛔ [LOGIN] La contraseña NO coincide con el hash.");
      return res.status(400).json("Contraseña incorrecta");
    }

    console.log("🎉 [LOGIN] ¡Éxito! Generando token...");
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    const userData = { id: user.id, username: user.username, email: user.email };
    res.status(200).json({ user: userData, token });
  } catch (err) {
    console.error("❌ [LOGIN] Error CRÍTICO:", err); // Ver el error técnico si falla la BD
    res.status(500).send('Error del servidor: ' + err.message);
  }
});

module.exports = router;