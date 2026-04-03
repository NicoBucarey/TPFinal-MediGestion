const ConfirmacionTeleconsultaModal = ({ isOpen, onClose, onConfirm, fecha }) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="fixed inset-0 bg-black opacity-50"></div>

			<div className="bg-white rounded-lg p-6 w-96 relative z-10">
				<div className="text-center">
					<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
						<svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
						</svg>
					</div>

					<h3 className="text-lg font-medium text-gray-900 mb-2">
						Confirmar Teleconsulta
					</h3>

					<div className="text-sm text-gray-500 mb-6">
						<p className="mb-2">¿Desea confirmar la teleconsulta para el {fecha?.toLocaleString()}?</p>
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
							<p className="text-blue-800 text-xs mb-1">📧 Se enviará automáticamente:</p>
							<ul className="text-blue-700 text-xs space-y-1">
								<li>• Enlace de reunión al profesional</li>
								<li>• Enlace de reunión al paciente</li>
								<li>• Recordatorio 15 min antes</li>
							</ul>
						</div>
					</div>

					<div className="flex justify-center gap-4">
						<button
							onClick={onConfirm}
							className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
						>
							Programar Teleconsulta
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

export default ConfirmacionTeleconsultaModal;
