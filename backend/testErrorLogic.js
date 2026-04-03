// Simulación directa del error markedUnread
async function testErrorMockup() {
  console.log('🧪 Probando manejo de error markedUnread simulado...');
  
  // Simulamos el objeto de respuesta de WhatsApp con error markedUnread
  const errorMarkedUnread = new Error("Cannot read properties of undefined (reading 'markedUnread')");
  
  console.log('📋 Error simulado:');
  console.log('- Message:', errorMarkedUnread.message);
  console.log('- Contains markedUnread?:', errorMarkedUnread.message.includes('markedUnread'));
  
  // Simulamos la lógica de manejo de error
  let resultado;
  if (errorMarkedUnread.message && errorMarkedUnread.message.includes('markedUnread')) {
    console.log('✅ Error detectado correctamente');
    resultado = {
      success: true,
      warning: 'markedUnread_error',
      message: 'Mensaje enviado pero con advertencia de WhatsApp Web'
    };
  } else {
    console.log('❌ Error NO detectado');
    resultado = {
      success: false,
      error: errorMarkedUnread.message
    };
  }
  
  console.log('\n📊 Resultado esperado:');
  console.log(JSON.stringify(resultado, null, 2));
  
  // Simulamos el manejo en recordatorioService
  if (resultado.success) {
    const estado = resultado.warning ? 'enviado_con_advertencia' : 'enviado';
    console.log('\\n✅ Estado que se guardaría en BD:', estado);
    
    if (resultado.warning) {
      console.log('✅ WhatsApp enviado con advertencias');
    }
  }
}

testErrorMockup().catch(console.error);