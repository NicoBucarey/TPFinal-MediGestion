const cron = require('node-cron');
const RecordatorioService = require('../services/recordatorioService');

/**
 * Inicializar tareas programadas (cron jobs)
 */
const inicializarCronJobs = () => {
    // Ejecutar cada hora para procesar recordatorios pendientes
    cron.schedule('0 * * * *', async () => {
        console.log('Ejecutando tarea programada: Procesar recordatorios pendientes');
        try {
            const resultado = await RecordatorioService.procesarRecordatoriosPendientes();
            console.log(`Recordatorios procesados: ${resultado.procesados}`);
        } catch (error) {
            console.error('Error en cron job de recordatorios:', error);
        }
    });

    console.log('✅ Cron jobs inicializados correctamente');
    console.log('- Recordatorios: Se ejecuta cada hora');
};

module.exports = { inicializarCronJobs };
