const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.isInitializing = false;
    this.isAuthenticated = false;
    this.statePollInterval = null;
    this.authPath = path.join(__dirname, '..', '.wwebjs_auth');
    this.clientId = 'medigestion';
    this.sendQueue = Promise.resolve();
    this.recoveryInProgress = false;

    this.diagnostics = {
      initializedAt: null,
      lastEvent: 'idle',
      lastState: null,
      lastError: null,
      qrCount: 0,
      authenticatedCount: 0,
      readyAt: null,
      disconnectedReason: null
    };
  }

  iniciar() {
    if (this.client || this.isInitializing) return;
    this.initializeClient();
  }

  async actualizarReadyPorEstado() {
    if (!this.client) return false;
    try {
      const state = await this.client.getState();
      this.diagnostics.lastState = state;
      if (state === 'CONNECTED') {
        this.isReady = true;
        this.isInitializing = false;
        this.diagnostics.lastEvent = 'state_connected_fallback';
        if (!this.diagnostics.readyAt) {
          this.diagnostics.readyAt = new Date().toISOString();
        }
        return true;
      }
    } catch {
      // ignore state polling errors
    }
    return false;
  }

  iniciarSondeoEstado(ms = 2000) {
    this.detenerSondeoEstado();
    this.statePollInterval = setInterval(async () => {
      if (!this.client || this.isReady) {
        this.detenerSondeoEstado();
        return;
      }
      await this.actualizarReadyPorEstado();
    }, ms);
  }

  detenerSondeoEstado() {
    if (this.statePollInterval) {
      clearInterval(this.statePollInterval);
      this.statePollInterval = null;
    }
  }

  initializeClient() {
    if (this.isInitializing) return;

    this.isInitializing = true;
    this.isReady = false;
    this.isAuthenticated = false;
    this.diagnostics.initializedAt = new Date().toISOString();
    this.diagnostics.lastEvent = 'initializing';
    this.diagnostics.lastError = null;

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: this.clientId,
        dataPath: this.authPath
      }),
      // Fija una versión de WhatsApp Web conocida y compatible con whatsapp-web.js.
      // Esto evita el error "markedUnread" que ocurre cuando WhatsApp Web actualiza
      // sus objetos internos y la librería queda desincronizada con la versión nueva.
      webVersionCache: {
        type: 'remote',
        remotePath:
          'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
      },
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      }
    });

    this.client.on('qr', (qr) => {
      this.diagnostics.lastEvent = 'qr';
      this.diagnostics.qrCount += 1;

      console.log('\n📱 ========================================');
      console.log('   ESCANEA ESTE QR CON TU WHATSAPP');
      console.log('========================================\n');
      qrcode.generate(qr, { small: true });
      console.log('\n========================================\n');
    });

    this.client.on('loading_screen', (percent, message) => {
      this.diagnostics.lastEvent = 'loading_screen';
      this.diagnostics.lastState = `${percent}% ${message}`;
      console.log(`⏳ WhatsApp cargando ${percent}% - ${message}`);
    });

    this.client.on('authenticated', () => {
      this.isAuthenticated = true;
      this.diagnostics.lastEvent = 'authenticated';
      this.diagnostics.authenticatedCount += 1;
      console.log('🔐 WhatsApp autenticado correctamente');
      this.iniciarSondeoEstado();
    });

    this.client.on('change_state', (state) => {
      this.diagnostics.lastEvent = 'change_state';
      this.diagnostics.lastState = state;
      console.log(`📶 Estado de WhatsApp: ${state}`);
    });

    this.client.on('ready', () => {
      this.isReady = true;
      this.isInitializing = false;
      this.diagnostics.lastEvent = 'ready';
      this.diagnostics.readyAt = new Date().toISOString();
      this.diagnostics.lastError = null;
      this.detenerSondeoEstado();
      console.log('✅ WhatsApp conectado y listo para enviar mensajes!');
    });

    this.client.on('disconnected', (reason) => {
      this.isReady = false;
      this.isInitializing = false;
      this.client = null;
      this.diagnostics.lastEvent = 'disconnected';
      this.diagnostics.disconnectedReason = reason;
      this.detenerSondeoEstado();
      console.log('⚠️ WhatsApp desconectado:', reason);
    });

    this.client.on('auth_failure', (message) => {
      this.isReady = false;
      this.isInitializing = false;
      this.diagnostics.lastEvent = 'auth_failure';
      this.diagnostics.lastError = message;
      this.detenerSondeoEstado();
      console.error('❌ Falló la autenticación de WhatsApp:', message);
    });

    this.client.on('error', (error) => {
      this.diagnostics.lastEvent = 'error';
      this.diagnostics.lastError = error?.message || String(error);
      console.error('❌ Error interno de WhatsApp client:', error?.message || error);
    });

    this.client.initialize().catch((error) => {
      this.isReady = false;
      this.isInitializing = false;
      this.client = null;
      this.diagnostics.lastEvent = 'initialize_error';
      this.diagnostics.lastError = error?.message || String(error);
      this.detenerSondeoEstado();
      console.error('❌ Error al inicializar WhatsApp:', error?.message || error);
    });
  }

  async resetearSesion() {
    try {
      this.detenerSondeoEstado();
      if (this.client) {
        try {
          await this.client.destroy();
        } catch {
          // noop
        }
      }

      this.client = null;
      this.isReady = false;
      this.isInitializing = false;

      fs.rmSync(this.authPath, { recursive: true, force: true });

      this.diagnostics.lastEvent = 'session_reset';
      this.diagnostics.lastError = null;
      this.diagnostics.lastState = null;
      this.diagnostics.qrCount = 0;
      this.diagnostics.authenticatedCount = 0;
      this.diagnostics.readyAt = null;
      this.diagnostics.disconnectedReason = null;

      this.iniciar();
      return { success: true };
    } catch (error) {
      this.diagnostics.lastError = error?.message || String(error);
      return { success: false, error: error?.message || String(error) };
    }
  }

  esErrorRecuperableCliente(message) {
    const texto = String(message || '').toLowerCase();
    return (
      texto.includes('detached frame') ||
      texto.includes('execution context was destroyed') ||
      texto.includes('target closed') ||
      texto.includes('session closed') ||
      texto.includes('cannot find context')
    );
  }

  async reiniciarClienteSinReset() {
    if (this.recoveryInProgress) return;
    this.recoveryInProgress = true;
    try {
      console.warn('🔄 Reiniciando cliente WhatsApp por error recuperable de Puppeteer...');
      this.detenerSondeoEstado();

      if (this.client) {
        try {
          await this.client.destroy();
        } catch {
          // noop
        }
      }

      this.client = null;
      this.isReady = false;
      this.isInitializing = false;
      this.isAuthenticated = false;
      this.diagnostics.lastEvent = 'client_restart';
      this.diagnostics.lastState = null;

      this.initializeClient();
      await this.esperarConexion(60000);
    } finally {
      this.recoveryInProgress = false;
    }
  }

  async esperarConexion(timeoutMs = 45000) {
    if (this.isReady) return true;

    if (!this.client && !this.isInitializing) {
      this.initializeClient();
    }

    const startedAt = Date.now();
    while (!this.isReady && Date.now() - startedAt < timeoutMs) {
      if (this.isAuthenticated) {
        const conectado = await this.actualizarReadyPorEstado();
        if (conectado) {
          return true;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return this.isReady;
  }

  normalizarNumero(numero) {
    let numeroLimpio = String(numero || '').replace(/\D/g, '');

    if (!numeroLimpio) return null;

    if (!numeroLimpio.startsWith('54')) {
      numeroLimpio = `549${numeroLimpio}`;
    } else if (numeroLimpio.startsWith('54') && !numeroLimpio.startsWith('549')) {
      numeroLimpio = `549${numeroLimpio.substring(2)}`;
    }

    return numeroLimpio;
  }

  async verificarEnvioReciente(chatId, mensaje, segundosVentana = 60) {
    try {
      const chat = await this.client.getChatById(chatId);
      const mensajes = await chat.fetchMessages({ limit: 8 });
      const ahora = Math.floor(Date.now() / 1000);

      const normalizar = (text) => String(text || '').replace(/\s+/g, ' ').trim();
      const objetivo = normalizar(mensaje);

      return mensajes.some((m) => {
        const esMio = m.fromMe === true;
        const body = normalizar(m.body);
        const mismoTexto = body === objetivo || body.includes(objetivo.slice(0, Math.min(40, objetivo.length)));
        const esReciente = typeof m.timestamp === 'number' && (ahora - m.timestamp) <= segundosVentana;
        return esMio && mismoTexto && esReciente;
      });
    } catch (error) {
      console.warn('⚠️ No se pudo verificar envío reciente:', error.message);
      return false;
    }
  }

  async _enviarMensajeInterno(to, mensaje) {
    const maxReintentos = 3;
    let ultimoError = null;

    for (let intento = 1; intento <= maxReintentos; intento++) {
      let chatId = null;
      try {
        const conectado = await this.esperarConexion(45000);
        if (!conectado) {
          throw new Error('WhatsApp no está conectado. Escaneá el QR y esperá el mensaje de conexión.');
        }

        const numeroLimpio = this.normalizarNumero(to);
        if (!numeroLimpio) {
          return {
            success: false,
            error: 'Número de teléfono inválido',
            intentos: intento
          };
        }

        const numberId = await this.client.getNumberId(numeroLimpio);
        if (!numberId || !numberId._serialized) {
          return {
            success: false,
            error: `El número ${numeroLimpio} no está registrado en WhatsApp`,
            intentos: intento
          };
        }

        chatId = numberId._serialized;
        console.log(`📱 [Intento ${intento}/${maxReintentos}] Enviando a: ${numeroLimpio}`);

        let sent = null;
        try {
          sent = await this.client.sendMessage(chatId, mensaje);
        } catch (sendError) {
          // Si sigue ocurriendo markedUnread a pesar del webVersionCache,
          // es un error real — relanzar para que el reintento lo maneje.
          throw sendError;
        }

        return {
          success: true,
          messageId: sent?.id?._serialized,
          timestamp: sent?.timestamp,
          intentos: intento
        };
      } catch (error) {
        ultimoError = error;
        const message = String(error?.message || 'Error desconocido');
        this.diagnostics.lastError = message;
        console.warn(`⚠️ Error en intento ${intento}/${maxReintentos}: ${message}`);

        if (this.esErrorRecuperableCliente(message) && intento < maxReintentos) {
          try {
            await this.reiniciarClienteSinReset();
          } catch (recoveryError) {
            console.warn('⚠️ Falló recuperación automática de cliente WhatsApp:', recoveryError?.message || recoveryError);
          }
          await new Promise((resolve) => setTimeout(resolve, 1200));
          continue;
        }

        if (intento < maxReintentos) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          continue;
        }
      }
    }

    return {
      success: false,
      error: ultimoError?.message || 'No se pudo enviar el mensaje',
      intentos: maxReintentos
    };
  }

  async enviarMensaje(to, mensaje) {
    const run = async () => this._enviarMensajeInterno(to, mensaje);
    this.sendQueue = this.sendQueue.then(run, run);
    return this.sendQueue;
  }

  estaConectado() {
    return this.isReady;
  }

  obtenerDiagnostico() {
    return {
      isReady: this.isReady,
      isInitializing: this.isInitializing,
      hasClient: Boolean(this.client),
      ...this.diagnostics
    };
  }

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

  generarMensajeConfirmacion(turno, paciente, profesional) {
    const fecha = new Date(turno.fecha).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `✅ *Turno Confirmado - MediGestion*\n\nHola ${paciente.nombre}!\n\nTu turno ha sido confirmado:\n\n👨‍⚕️ Profesional: ${profesional.nombre} ${profesional.apellido}\n📅 Fecha: ${fecha}\n🕐 Hora: ${turno.hora_inicio}\n\nPor favor, llegá 10 minutos antes.\n\nSi necesitás cancelar o reprogramar, contactanos.`;
  }

  generarMensajeRecordatorio24h(turno, paciente, profesional) {
    const fecha = new Date(turno.fecha).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `🔔 *Recordatorio de Turno - MediGestion*\n\nHola ${paciente.nombre}!\n\nTe recordamos que tenés un turno mañana:\n\n👨‍⚕️ Profesional: ${profesional.nombre} ${profesional.apellido}\n📅 Fecha: ${fecha}\n🕐 Hora: ${turno.hora_inicio}\n\nPor favor, llegá 10 minutos antes.\n\nNos vemos mañana!`;
  }

  generarMensajeTeleconsulta(turno, paciente, profesional, linkReunion) {
    const fecha = new Date(turno.fecha).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `🎥 *Teleconsulta Confirmada - MediGestion*\n\nHola ${paciente.nombre}!\n\nTu teleconsulta ha sido confirmada:\n\n👨‍⚕️ Profesional: ${profesional.nombre} ${profesional.apellido}\n📅 Fecha: ${fecha}\n🕐 Hora: ${turno.hora_inicio}\n\n🔗 *Enlace de reunión:*\n${linkReunion}\n\n📋 *Instrucciones:*\n• Conectate 5 minutos antes\n• Asegurate de tener buena conexión a internet\n• Tené a mano tu documento y estudios médicos\n\n¡Nos vemos virtualmente!`;
  }

  generarMensajeSeguimiento(seguimiento, paciente, profesional) {
    const fechaInicio = new Date(seguimiento.fecha_inicio).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const frecuenciaTexto = {
      unica: 'única',
      diaria: 'diaria',
      semanal: 'semanal',
      mensual: 'mensual'
    };

    const baseUrl = process.env.FRONTEND_URL || 'https://sistema.medigestion.app';
    const enlaceSeguimiento = `${baseUrl}/seguimiento/${seguimiento.id_seguimiento}`;

    return `📋 *Seguimiento Post-Consulta - MediGestion*\n\nHola ${paciente.nombre}!\n\nEl Dr. ${profesional.nombre} ${profesional.apellido} ha programado un seguimiento médico para ti.\n\n📅 Fecha de inicio: ${fechaInicio}\n🔄 Frecuencia: ${frecuenciaTexto[seguimiento.frecuencia_tipo] || seguimiento.frecuencia_tipo}\n${seguimiento.fecha_fin ? `📅 Hasta: ${new Date(seguimiento.fecha_fin).toLocaleDateString('es-AR')}` : ''}\n\n📱 *COMPLETÁ TU SEGUIMIENTO AQUÍ:*\n${enlaceSeguimiento}\n\n*¡Es muy simple!* Solo haz clic en el enlace y responde las preguntas de tu profesional.\n\n¡Tu salud es importante!`;
  }
}

module.exports = new WhatsAppService();
