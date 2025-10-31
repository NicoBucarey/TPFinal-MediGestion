const ConfirmacionTurnoModal = ({ isOpen, onClose, onConfirm, fecha }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black opacity-50"></div>
      
      {/* Modal */}
      <div className="bg-white rounded-lg p-6 w-96 relative z-10">
        <div className="text-center">
          {/* Icono de éxito */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Confirmar Turno
          </h3>
          
          <p className="text-sm text-gray-500 mb-6">
            ¿Desea confirmar el turno para el {fecha.toLocaleString()}?
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Confirmar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionTurnoModal;