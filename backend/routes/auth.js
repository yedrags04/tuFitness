const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTRO
router.post('/register', async (req, res) => {
  try {
    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Crear nuevo usuario
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    // 1. BUSCAR USUARIO por el campo 'username' que envía el frontend
    const user = await User.findOne({ username: req.body.username }); // <-- SOLUCIÓN AQUÍ
    
    // Si no encuentra el usuario
    if (!user) {
        return res.status(404).json("Usuario no encontrado");
    }

    // 2. Comparar contraseña
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
        return res.status(400).json("Contraseña incorrecta");
    }

    // 3. Generar Token (JWT)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    // Devolver usuario (sin contraseña) y token
    const { password, ...others } = user._doc;
    res.status(200).json({ ...others, token });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;