const router = require('express').Router();
const { Routine, Exercise, Set, Op } = require('../db/sequelize');
const auth = require('../middleware/auth');


const normalizarDia = (valor) => {
    if (!valor) return "1";
    const str = String(valor).toLowerCase().trim();
    
    
    const mapa = {
        'lunes': "1", 'martes': "2", 'miercoles': "3", 'miércoles': "3",
        'jueves': "4", 'viernes': "5", 'sabado': "6", 'sábado': "6", 'domingo': "7",
        'dia 1': "1", 'día 1': "1", 'day 1': "1"
    };
    
    if (mapa[str]) return mapa[str];

    const match = str.match(/\d+/);
    return match ? match[0] : "1";
};


router.get('/', auth, async (req, res) => {
  try {
    const routines = await Routine.findAll({
      where: {
        [Op.or]: [
          { UsuarioId: req.user.id }, 
          { esPredeterminada: true }      
        ]
      },
      include: [{ 
        model: Exercise, 
        include: [{ model: Set }] 
      }], 
      order: [['id', 'DESC']]
    });
    res.json(routines);
  } catch (err) {
    console.error("Error GET /routines:", err);
    res.status(500).send('Error del servidor');
  }
});


router.post('/', auth, async (req, res) => {
    const { name, duration, exercises, isDefault } = req.body; 

    try {
        if (!name || !name.trim()) return res.status(400).json({ msg: "Nombre obligatorio" });

        const newRoutine = await Routine.create({
            nombre: name, 
            esPredeterminada: isDefault || false, 
            UsuarioId: req.user.id
        });

        if (exercises?.length > 0) {
            for (const ex of exercises) {
                await Exercise.create({
                    nombre: ex.name, 
                    
                    dia: normalizarDia(ex.day), 
                    RutinaId: newRoutine.id 
                }).then(async (newEx) => {
                    if (ex.series?.length > 0) {
                        const sets = ex.series.map(s => ({
                            repeticiones: parseInt(s.reps) || 0,
                            peso: parseFloat(s.weight) || 0,
                            EjercicioId: newEx.id
                        }));
                        await Set.bulkCreate(sets);
                    }
                });
            }
        }
        
        const result = await Routine.findByPk(newRoutine.id, { include: [{ model: Exercise, include: [Set] }] });
        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al guardar');
    }
});

router.put('/:id', auth, async (req, res) => {
    const { name, duration, exercises } = req.body;
    const routineId = req.params.id;

    try {
        const routine = await Routine.findByPk(routineId);
        if (!routine) return res.status(404).json({ msg: "No encontrada" });
        if (routine.UsuarioId !== req.user.id) return res.status(401).json({ msg: "No autorizado" });

        await routine.update({ nombre: name, duration: duration });

        
        await Exercise.destroy({ where: { RutinaId: routineId } }); 
        
       
        if (exercises?.length > 0) {
            for (const ex of exercises) {
                await Exercise.create({
                    nombre: ex.name, 
                    dia: normalizarDia(ex.day), 
                    RutinaId: routineId 
                }).then(async (newEx) => {
                    if (ex.series?.length > 0) {
                        const sets = ex.series.map(s => ({
                            repeticiones: parseInt(s.reps) || 0,
                            peso: parseFloat(s.weight) || 0,
                            EjercicioId: newEx.id
                        }));
                        await Set.bulkCreate(sets);
                    }
                });
            }
        }
        res.status(200).json({ msg: "Actualizada" });
    } catch (err) { 
        console.error(err);
        res.status(500).send('Error al editar');
    }
});


router.delete('/:id', auth, async (req, res) => {
    try {
        const routine = await Routine.findByPk(req.params.id);
        if (!routine) return res.status(404).json({ msg: "No encontrada" });
        if (routine.UsuarioId !== req.user.id) return res.status(401).json({ msg: "No autorizado" });
        await routine.destroy(); 
        res.status(200).json({ msg: "Eliminada" });
    } catch (err) { res.status(500).send("Error"); }
});

module.exports = router;