const PacienteModel = require('../model/pacienteModel');

const PacienteController = {
  buscarPacientes: async (req, res) => {
    try {
      const { dni, apellido, email } = req.query;
      let criterio, valor;

      if (dni) {
        criterio = 'dni';
        valor = dni;
      } else if (apellido) {
        criterio = 'apellido';
        valor = apellido;
      } else if (email) {
        criterio = 'email';
        valor = email;
      } else {
        return res.status(400).json({ error: 'Se requiere al menos un criterio de búsqueda (dni, apellido o email)' });
      }

      const pacientes = await PacienteModel.buscarPorCriterio(criterio, valor);
      res.json(pacientes);
    } catch (error) {
      console.error('Error en PacienteController.buscarPacientes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = PacienteController;