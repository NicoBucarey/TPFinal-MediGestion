import { useEffect, useState } from 'react';

/**
 * useSecretarioBooking
 * Manages the shared state for the first two steps of every secretary
 * booking flow: selecting a patient (step 1) and a professional (step 2).
 *
 * Returns:
 *   paciente              – currently selected patient object (null if none)
 *   setPaciente           – setter (pass directly to BusquedaPaciente.onPacienteSelect)
 *   profesionalId         – currently selected professional ID string
 *   setProfesionalId      – raw setter for professional ID
 *   handleProfesionalSelect – onChange handler compatible with SelectProfesional
 *   paso                  – derived step: 1 = no patient, 2 = no prof, 3 = both selected
 *   reset                 – resets all state back to step 1
 */
const useSecretarioBooking = ({ initialPaciente = null, lockPaciente = false } = {}) => {
  const [paciente, setPaciente] = useState(initialPaciente);
  const [profesionalId, setProfesionalId] = useState('');

  useEffect(() => {
    if (initialPaciente) {
      setPaciente(initialPaciente);
    }
  }, [initialPaciente]);

  // Step is derived from state — no chance of it going out of sync
  const paso = !paciente ? 1 : !profesionalId ? 2 : 3;

  const handleProfesionalSelect = (e) => setProfesionalId(e.target.value);

  const reset = () => {
    if (!lockPaciente) {
      setPaciente(null);
    }
    setProfesionalId('');
  };

  return {
    paciente,
    setPaciente,
    profesionalId,
    setProfesionalId,
    handleProfesionalSelect,
    paso,
    reset,
  };
};

export default useSecretarioBooking;
