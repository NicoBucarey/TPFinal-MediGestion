const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

class WhatsAppService {
  /**
   * Genera el mensaje de confirmación de turnos periódicos
   */
  generarMensajeConfirmacionPeriodico(turnos, paciente, profesional) {
    let mensaje = `✅ *Turno Confirmado - MediGestion*\n\nHola ${paciente.nombre}!\n\nTus turnos han sido confirmados:\n\n👨‍⚕️ Profesional: ${profesional.nombre} ${profesional.apellido}\n`;
    for (const t of turnos) {
      const fechaStr = new Date(t.fecha).toLocaleDateString('es-AR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      mensaje += `\n📅 Fecha: ${fechaStr}  🕐 Hora: ${t.hora_inicio}`;
    }
    mensaje += `\n\nPor favor, llegá 10 minutos antes.\n\nSi necesitás cancelar o reprogramar, contactanos.`;
    return mensaje;
  }
  constructor() {
    this.client = null;
    this.isReady = false;
    this.initializeClient();
  }

  /**
   * Inicializa el cliente de WhatsApp
   */
  initializeClient() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    // Muestra el QR en la consola
    this.client.on('qr', (qr) => {
      console.log('\n📱 ========================================');
      console.log('   ESCANEA ESTE QR CON TU WHATSAPP');
      console.log('========================================\n');
      qrcode.generate(qr, { small: true });
      console.log('\n========================================\n');
    });

    // Cliente listo
    this.client.on('ready', () => {
      console.log('✅ WhatsApp conectado y listo para enviar mensajes!');
      this.isReady = true;
    });

    // Manejo de desconexión
    this.client.on('disconnected', (reason) => {
      console.log('⚠️ WhatsApp desconectado:', reason);
      this.isReady = false;
    });

    // Inicializar
    this.client.initialize();
  }

  /**
   * Envía un mensaje de WhatsApp
   * @param {string} to - Número de teléfono destino (puede ser solo el número local: 2994573646)
   * @param {string} mensaje - Mensaje a enviar
   * @returns {Promise<Object>} - Resultado del envío
   */
  async enviarMensaje(to, mensaje) {
    try {
      if (!this.isReady) {
        console.warn('⚠️ WhatsApp no está conectado. El mensaje no se enviará.');
        return {
          success: false,
          error: 'WhatsApp no está conectado. Escanea el QR primero.'
        };
      }

      // Limpiar el número (eliminar espacios, guiones, paréntesis, etc)
      let numeroLimpio = to.replace(/\D/g, ''); // Elimina todo lo que no sea dígito
      
      // Si el número no empieza con 54 (código Argentina), agregarlo automáticamente
      if (!numeroLimpio.startsWith('54')) {
        numeroLimpio = '549' + numeroLimpio; // 549 = Argentina + celular
      } else if (numeroLimpio.startsWith('54') && !numeroLimpio.startsWith('549')) {
        // Si empieza con 54 pero no tiene el 9, agregarlo
        numeroLimpio = '549' + numeroLimpio.substring(2);
      }

      // Formato para whatsapp-web.js: número@c.us
      const chatId = `${numeroLimpio}@c.us`;

      console.log(`📱 Enviando WhatsApp a: ${numeroLimpio} (original: ${to})`);
      const message = await this.client.sendMessage(chatId, mensaje);

      console.log(`✅ WhatsApp enviado exitosamente a ${numeroLimpio}`);
      return {
        success: true,
        messageId: message.id._serialized,
        timestamp: message.timestamp
      };
    } catch (error) {
      console.error(`❌ Error enviando WhatsApp a ${to}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verifica si el cliente está listo
   */
  estaConectado() {
    return this.isReady;
  }

  /**
   * Genera el mensaje de confirmación de turno
   */
  generarMensajeConfirmacion(turno, paciente, profesional) {
    const fecha = new Date(turno.fecha).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `✅ *Turno Confirmado - MediGestion*

Hola ${paciente.nombre}!

Tu turno ha sido confirmado:

👨‍⚕️ Profesional: ${profesional.nombre} ${profesional.apellido}
📅 Fecha: ${fecha}
🕐 Hora: ${turno.hora_inicio}

Por favor, llegá 10 minutos antes.

Si necesitás cancelar o reprogramar, contactanos.`;
  }

  /**
   * Genera el mensaje de recordatorio 24h antes
   */
  generarMensajeRecordatorio24h(turno, paciente, profesional) {
    const fecha = new Date(turno.fecha).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `🔔 *Recordatorio de Turno - MediGestion*

Hola ${paciente.nombre}!

Te recordamos que tenés un turno mañana:

👨‍⚕️ Profesional: ${profesional.nombre} ${profesional.apellido}
📅 Fecha: ${fecha}
🕐 Hora: ${turno.hora_inicio}

Por favor, llegá 10 minutos antes.

Nos vemos mañana!`;
  }

  /**
   * Genera el mensaje de confirmación de teleconsulta
   */
  generarMensajeTeleconsulta(turno, paciente, profesional, linkReunion) {
    const fecha = new Date(turno.fecha).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `🎥 *Teleconsulta Confirmada - MediGestion*

Hola ${paciente.nombre}!

Tu teleconsulta ha sido confirmada:

👨‍⚕️ Profesional: ${profesional.nombre} ${profesional.apellido}
📅 Fecha: ${fecha}
🕐 Hora: ${turno.hora_inicio}

🔗 *Enlace de reunión:*
${linkReunion}

📋 *Instrucciones:*
• Conectate 5 minutos antes
• Asegurate de tener buena conexión a internet
• Tené a mano tu documento y estudios médicos

¡Nos vemos virtualmente!`;
  }

  /**
   * Genera el mensaje de notificación de seguimiento
   */
  generarMensajeSeguimiento(seguimiento, paciente, profesional) {
    const fechaInicio = new Date(seguimiento.fecha_inicio).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const frecuenciaTexto = {
      'unica': 'única',
      'diaria': 'diaria',
      'semanal': 'semanal',
      'mensual': 'mensual'
    };

    // URL del seguimiento público
    const baseUrl = process.env.FRONTEND_URL || 'https://sistema.medigestion.app';
    const enlaceSeguimiento = `${baseUrl}/seguimiento/${seguimiento.id_seguimiento}`;

    return `📋 *Seguimiento Post-Consulta - MediGestion*

Hola ${paciente.nombre}!

El Dr. ${profesional.nombre} ${profesional.apellido} ha programado un seguimiento médico para ti.

📅 Fecha de inicio: ${fechaInicio}
🔄 Frecuencia: ${frecuenciaTexto[seguimiento.frecuencia_tipo] || seguimiento.frecuencia_tipo}
${seguimiento.fecha_fin ? `📅 Hasta: ${new Date(seguimiento.fecha_fin).toLocaleDateString('es-AR')}` : ''}

📱 *COMPLETÁ TU SEGUIMIENTO AQUÍ:*
${enlaceSeguimiento}

*¡Es muy simple!* Solo haz clic en el enlace y responde las preguntas de tu profesional.

¡Tu salud es importante!`;
  }
}

module.exports = new WhatsAppService();
