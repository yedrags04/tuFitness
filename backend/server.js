// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./db/sequelize'); 
const authRoute = require('./routes/auth');
const routineRoute = require('./routes/routines');

dotenv.config();
const app = express();

// Iniciar la conexión a la base de datos
connectDB(); 

app.use(cors());
app.use(express.json()); 

// Rutas
app.use("/api/auth", authRoute);
app.use("/api/routines", routineRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});