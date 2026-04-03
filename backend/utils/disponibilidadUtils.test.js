const test = require('node:test');
const assert = require('node:assert/strict');
const disponibilidadUtils = require('./disponibilidadUtils');

test('genera fechas semanales respetando día de semana', () => {
  const fechas = disponibilidadUtils._generarFechasPeriodicas(
    '2026-03-01',
    '2026-03-31',
    'semanal',
    'lunes'
  );

  assert.deepEqual(fechas, ['2026-03-02', '2026-03-09', '2026-03-16', '2026-03-23', '2026-03-30']);
});

test('normaliza tildes en día de semana (miércoles)', () => {
  const fechas = disponibilidadUtils._generarFechasPeriodicas(
    '2026-03-01',
    '2026-03-31',
    'semanal',
    'miércoles'
  );

  assert.deepEqual(fechas, ['2026-03-04', '2026-03-11', '2026-03-18', '2026-03-25']);
});

test('genera fechas quincenales desde el primer match del rango', () => {
  const fechas = disponibilidadUtils._generarFechasPeriodicas(
    '2026-03-01',
    '2026-04-30',
    'quincenal',
    'viernes'
  );

  assert.deepEqual(fechas, ['2026-03-06', '2026-03-20', '2026-04-03', '2026-04-17']);
});

test('modo libre genera todos los días del rango inclusive', () => {
  const fechas = disponibilidadUtils._generarFechasPeriodicas(
    '2026-03-10',
    '2026-03-13',
    'libre',
    'lunes'
  );

  assert.deepEqual(fechas, ['2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13']);
});

test('validarDisponibilidadPeriodica agrupa conflictos detectados', async () => {
  const original = disponibilidadUtils.validarDisponibilidad;

  disponibilidadUtils.validarDisponibilidad = async (_id, fecha) => {
    if (fecha === '2026-03-11') {
      return { disponible: false, mensaje: 'ocupado' };
    }
    return { disponible: true, mensaje: 'ok' };
  };

  const result = await disponibilidadUtils.validarDisponibilidadPeriodica(
    1,
    '2026-03-09',
    '2026-03-16',
    '10:00:00',
    '10:30:00',
    'semanal',
    'miercoles'
  );

  assert.equal(result.disponible, false);
  assert.equal(result.conflictos.length, 1);
  assert.equal(result.conflictos[0].fecha, '2026-03-11');

  disponibilidadUtils.validarDisponibilidad = original;
});
