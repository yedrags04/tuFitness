// backend/server.js
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db/sequelize'); 
const authRoute = require('./middleware/auth');
const routineRoute = require('./routes/routines');


const app = express();

// Iniciar la conexión a la base de datos
connectDB(); 

app.use(cors());
app.use(express.json()); 

// Rutas
app.use("/api/auth", authRoute);
app.use("/api/routines", routineRoute);
app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 42311;

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});