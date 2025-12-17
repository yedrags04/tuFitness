
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const { User } = require('../db/sequelize'); 
const auth = require('../middleware/auth'); 


router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

       
        let edadCalculada = '';
        if (user.anioNacimiento) {
            const currentYear = new Date().getFullYear();
            edadCalculada = currentYear - user.anioNacimiento;
        }

        
        const userData = {
            nombre: user.username,
            email: user.email,
            edad: edadCalculada, 
            peso: user.peso,
            altura: user.estatura,
            genero: user.genero === true ? 'Hombre' : user.genero === false ? 'Mujer' : 'No especificado'
        };

        res.json(userData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});


router.put('/profile', auth, async (req, res) => {
   
    const { nombre, email, peso, altura, passwordActual, passwordNueva } = req.body;

    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

        
        if (nombre) user.username = nombre;
        if (email) user.email = email;
        if (peso) user.peso = peso;
        if (altura) user.estatura = altura;

        
        if (passwordNueva && passwordNueva.trim() !== '') {
            if (!passwordActual) {
                return res.status(400).json({ msg: 'Para cambiar la contraseña, debes ingresar tu contraseña actual.' });
            }

            
            const isMatch = await bcrypt.compare(passwordActual, user.contrasena);
            if (!isMatch) {
                return res.status(400).json({ msg: 'La contraseña actual es incorrecta.' });
            }

            
            const salt = await bcrypt.genSalt(10);
            user.contrasena = await bcrypt.hash(passwordNueva, salt);
        }

        await user.save();
        res.json({ msg: 'Perfil actualizado correctamente' });

    } catch (err) {
        console.error(err.message);
        
        if (err.name === 'SequelizeUniqueConstraintError') {
             return res.status(400).json({ msg: 'El nombre de usuario o correo ya están en uso.' });
        }
        res.status(500).send('Error del servidor al actualizar');
    }
});

module.exports = router;