
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db/sequelize'); 
//const authRoute = require('./middleware/auth');
const routineRoute = require('./routes/routines');
const authRoute = require('./routes/auth');
const usersRoute = require('./routes/users');

const app = express();


connectDB(); 

app.use(cors());
app.use(express.json()); 

// Rutas
app.use("/api/auth", authRoute);
app.use("/api/routines", routineRoute);
app.use('/api/users', usersRoute);

const PORT = process.env.PORT || 42311;

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});