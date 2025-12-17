
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../db/sequelize'); 


router.post('/register', async (req, res) => {
    const { username, email, contrasena, genero, anioNacimiento, estatura, peso } = req.body;
    
    try {
        if (!contrasena) return res.status(400).json({ msg: "Contraseña requerida." });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        const newUser = await User.create({
            username,
            email,
            contrasena: hashedPassword,
            genero, 
            anioNacimiento, 
            estatura, 
            peso
        });

        res.status(201).json({ msg: "Usuario registrado con éxito" });
    } catch (err) {
        console.error("❌ [REGISTER] Error:", err);
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ msg: "El nombre de usuario o email ya están en uso." });
        }
        res.status(500).send('Error del servidor');
    }
});


router.post('/login', async (req, res) => {
    const { username, contrasena } = req.body; 
    
    try {
        const user = await User.findOne({ where: { username } }); 
        if (!user) return res.status(404).json("Usuario no encontrado");

        const validPassword = await bcrypt.compare(contrasena, user.contrasena); 
        if (!validPassword) return res.status(400).json("Contraseña incorrecta");
        
    
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        
        const userData = { 
            id: user.id, 
            username: user.username, 
            email: user.email
        }; 

        res.status(200).json({ user: userData, token }); 
    } catch (err) {
        console.error("❌ [LOGIN] Error:", err);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;