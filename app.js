
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Rutas
const solicitudRoutes = require('./routes/solicitudes');
app.use('/solicitudes', solicitudRoutes);

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error de conexión:', err));
const PORT = process.env.PORT || 27017;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
