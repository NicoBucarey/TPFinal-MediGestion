import { renderHook, act } from '@testing-library/react';
import useSecretarioBooking from './useSecretarioBooking';

describe('useSecretarioBooking', () => {
  it('inicia en paso 1 con estado vacío', () => {
    const { result } = renderHook(() => useSecretarioBooking());

    expect(result.current.paciente).toBeNull();
    expect(result.current.profesionalId).toBe('');
    expect(result.current.paso).toBe(1);
  });

  it('pasa a paso 2 cuando se selecciona paciente', () => {
    const { result } = renderHook(() => useSecretarioBooking());

    act(() => {
      result.current.setPaciente({ id_usuario: 10, nombre: 'Ana' });
    });

    expect(result.current.paciente).toEqual({ id_usuario: 10, nombre: 'Ana' });
    expect(result.current.paso).toBe(2);
  });

  it('pasa a paso 3 cuando hay paciente y profesional', () => {
    const { result } = renderHook(() => useSecretarioBooking());

    act(() => {
      result.current.setPaciente({ id_usuario: 10, nombre: 'Ana' });
      result.current.setProfesionalId('25');
    });

    expect(result.current.profesionalId).toBe('25');
    expect(result.current.paso).toBe(3);
  });

  it('handleProfesionalSelect toma value del event target', () => {
    const { result } = renderHook(() => useSecretarioBooking());

    act(() => {
      result.current.setPaciente({ id_usuario: 10, nombre: 'Ana' });
      result.current.handleProfesionalSelect({ target: { value: '77' } });
    });

    expect(result.current.profesionalId).toBe('77');
    expect(result.current.paso).toBe(3);
  });

  it('reset vuelve todo al estado inicial', () => {
    const { result } = renderHook(() => useSecretarioBooking());

    act(() => {
      result.current.setPaciente({ id_usuario: 10 });
      result.current.setProfesionalId('25');
    });

    expect(result.current.paso).toBe(3);

    act(() => {
      result.current.reset();
    });

    expect(result.current.paciente).toBeNull();
    expect(result.current.profesionalId).toBe('');
    expect(result.current.paso).toBe(1);
  });
});
