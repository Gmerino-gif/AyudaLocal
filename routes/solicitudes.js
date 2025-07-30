
const express = require('express');
const router = express.Router();
const Solicitud = require('../models/solicitud');

// Obtener todas las solicitudes
router.get('/', async (req, res) => {
  const solicitudes = await Solicitud.find();
  res.json(solicitudes);
});

// Crear una nueva solicitud
router.post('/', async (req, res) => {
  const nueva = new Solicitud(req.body);
  await nueva.save();
  res.json(nueva);
});

// Marcar solicitud como atendida
router.put('/:id', async (req, res) => {
  const actualizada = await Solicitud.findByIdAndUpdate(req.params.id, { estado: 'atendida' }, { new: true });
  res.json(actualizada);
});

module.exports = router;
