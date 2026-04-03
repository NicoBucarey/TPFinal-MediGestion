const WhatsAppService = require('./services/whatsappService');

async function testErrorHandling() {
  console.log('🧪 Probando manejo de error markedUnread...');
  
  // Crear instancia del servicio
  const whatsappService = new WhatsAppService();
  
  // Esperar a que se conecte WhatsApp
  console.log('⏳ Esperando conexión de WhatsApp...');
  
  // Esperar 5 segundos para la conexión
  setTimeout(async () => {
    if (whatsappService.estaConectado()) {
      console.log('✅ WhatsApp conectado, enviando mensaje de prueba...');
      
      try {
        const resultado = await whatsappService.enviarMensaje(
          '2994573646', 
          '🧪 Mensaje de prueba - Sistema de turnos'
        );
        
        console.log('\n📋 Resultado del envío:');
        console.log(JSON.stringify(resultado, null, 2));
        
        if (resultado.success) {
          if (resultado.warning) {
            console.log('✅ ERROR MANEJADO CORRECTAMENTE - Advertencia detectada');
          } else {
            console.log('✅ MENSAJE ENVIADO EXITOSAMENTE');
          }
        } else {
          console.log('❌ ERROR NO MANEJADO:', resultado.error);
        }
        
      } catch (error) {
        console.log('💥 ERROR CRÍTICO:', error.message);
      }
    } else {
      console.log('❌ WhatsApp no conectado después de 5 segundos');
    }
    
    process.exit(0);
  }, 5000);
}

testErrorHandling().catch(console.error);