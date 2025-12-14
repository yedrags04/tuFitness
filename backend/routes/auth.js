// backend/routes/auth.js (FINALMENTE CORREGIDO)

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../db/sequelize'); 

// REGISTRO (/api/auth/register)
router.post('/register', async (req, res) => {
    // Asegura la extracción de todos los campos, usando 'contrasena'
    const { 
        username, 
        email, 
        contrasena, 
        genero, 
        anioNacimiento, 
        estatura, 
        peso 
    } = req.body;
    
    // Si necesitas ver qué llega exactamente (debug)
    console.log("📩 [REGISTER] Datos recibidos:", { username, email }); 

    try {
        if (!contrasena) {
            return res.status(400).json({ msg: "Contraseña requerida." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        const newUser = await User.create({
            username,
            email,
            contrasena: hashedPassword, // Guardando el hash
            genero, 
            anioNacimiento, 
            estatura, 
            peso
        });

        console.log("✅ [REGISTER] Usuario creado con ID:", newUser.id);
        res.status(201).json({ msg: "Usuario registrado con éxito" });
    } catch (err) {
        console.error("❌ [REGISTER] Error:", err);
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ msg: "El nombre de usuario o email ya están en uso." });
        }
        res.status(500).send('Error del servidor: ' + err.message);
    }
});

// LOGIN (/api/auth/login)
router.post('/login', async (req, res) => {
    // 🔑 CLAVE: Extraer 'contrasena' para la entrada
    const { username, contrasena } = req.body; 
    
    console.log("--------------------------------------------------");
    console.log("🔑 [LOGIN] Intento de acceso para:", username);
    console.log("🔑 [LOGIN] Contraseña enviada:", contrasena ? 'Sí' : 'undefined'); 

    try {
        // 1. Buscar usuario en la BD (incluye el hash de contrasena por defecto)
        const user = await User.findOne({ where: { username } }); 
        
        if (!user) {
            console.log("⛔ [LOGIN] Usuario NO encontrado en la base de datos.");
            return res.status(404).json("Usuario no encontrado");
        }

        console.log("✅ [LOGIN] Usuario encontrado en BD. ID:", user.id);
        console.log("🔐 [LOGIN] Hash almacenado:", user.contrasena ? 'Sí' : 'undefined'); 

        // 2. Comparar contraseñas
        const validPassword = await bcrypt.compare(contrasena, user.contrasena); 
        
        if (!validPassword) {
            console.log("⛔ [LOGIN] La contraseña NO coincide con el hash.");
            return res.status(400).json("Contraseña incorrecta");
        }
        
        // -----------------------------------------------------------------
        // 🔑 CLAVE: LÓGICA DE ÉXITO FALTANTE
        // -----------------------------------------------------------------
        
        // 3. Generar Token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        
        // 4. Crear objeto de respuesta LIMPIO (sin el hash de la contraseña)
        const userData = { 
            id: user.id, 
            username: user.username, 
            email: user.email,
            // Puedes añadir otros campos limpios aquí si son necesarios en el frontend:
            // genero: user.genero,
        }; 

        console.log("🎉 [LOGIN] ¡Éxito! Generando token...");
        
        // 5. Enviar Respuesta de Éxito
        res.status(200).json({ user: userData, token }); 
        
    } catch (err) {
        console.error("❌ [LOGIN] Error CRÍTICO:", err);
        res.status(500).send('Error del servidor: ' + err.message);
    }
});

module.exports = router;