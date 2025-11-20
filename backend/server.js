const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoute = require('./routes/auth');
const routineRoute = require('./routes/routines');

dotenv.config();
const app = express();

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Conexión a DB exitosa"))
  .catch((err) => console.log(err));

app.use(cors()); // Permite que el frontend (puerto 3000) hable con backend (puerto 5000)
app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/routines", routineRoute);

app.listen(5000, () => {
  console.log("Servidor backend corriendo en puerto 5000");
});