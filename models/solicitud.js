
const mongoose = require('mongoose');

const solicitudSchema = new mongoose.Schema({
  nombre: String,
  tipoAyuda: String,
  barrio: String,
  contacto: String,
  estado: { type: String, default: 'pendiente' },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Solicitud', solicitudSchema);
