// backend/routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Necesario para comparar contraseñas
const { User } = require('../db/sequelize'); 
const auth = require('../middleware/auth'); // Tu middleware de token

// @route   GET api/users/profile
// @desc    Obtener datos del usuario
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        // Calcular edad basada en anioNacimiento (si existe)
        let edadCalculada = '';
        if (user.anioNacimiento) {
            const currentYear = new Date().getFullYear();
            edadCalculada = currentYear - user.anioNacimiento;
        }

        // Preparamos los datos para el Frontend
        const userData = {
            nombre: user.username,
            email: user.email,
            edad: edadCalculada, // Solo para visualización
            peso: user.peso,
            altura: user.estatura,
            // Convertimos el booleano a texto para visualización (opcional)
            genero: user.genero === true ? 'Hombre' : user.genero === false ? 'Mujer' : 'No especificado'
        };

        res.json(userData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   PUT api/users/profile
// @desc    Actualizar nombre, email, altura, peso y contraseña
router.put('/profile', auth, async (req, res) => {
    // Extraemos solo lo que permitimos editar + contraseñas
    const { nombre, email, peso, altura, passwordActual, passwordNueva } = req.body;

    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

        // 1. Actualización de datos básicos
        if (nombre) user.username = nombre;
        if (email) user.email = email;
        if (peso) user.peso = peso;
        if (altura) user.estatura = altura;

        // 2. Lógica de cambio de contraseña
        if (passwordNueva && passwordNueva.trim() !== '') {
            if (!passwordActual) {
                return res.status(400).json({ msg: 'Para cambiar la contraseña, debes ingresar tu contraseña actual.' });
            }

            // Verificar contraseña actual
            const isMatch = await bcrypt.compare(passwordActual, user.contrasena);
            if (!isMatch) {
                return res.status(400).json({ msg: 'La contraseña actual es incorrecta.' });
            }

            // Encriptar nueva contraseña
            const salt = await bcrypt.genSalt(10);
            user.contrasena = await bcrypt.hash(passwordNueva, salt);
        }

        await user.save();
        res.json({ msg: 'Perfil actualizado correctamente' });

    } catch (err) {
        console.error(err.message);
        // Capturar error de duplicados (ej: cambiar email a uno que ya existe)
        if (err.name === 'SequelizeUniqueConstraintError') {
             return res.status(400).json({ msg: 'El nombre de usuario o correo ya están en uso.' });
        }
        res.status(500).send('Error del servidor al actualizar');
    }
});

module.exports = router;