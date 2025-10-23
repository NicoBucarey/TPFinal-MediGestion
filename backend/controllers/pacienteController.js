const PacienteModel = require('../model/pacienteModel');

const PacienteController = {
  buscarPacientes: async (req, res) => {
    try {
      const { termino } = req.query;
      
      if (!termino) {
        return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
      }

      const pacientes = await PacienteModel.buscarUnificado(termino);
      res.json(pacientes);
    } catch (error) {
      console.error('Error en PacienteController.buscarPacientes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = PacienteController;