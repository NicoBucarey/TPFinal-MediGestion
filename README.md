# Medigestion

## Configuración del Proyecto

### Frontend

1. Navega a la carpeta del frontend:
```bash
cd frontend
# Medigestion

**Medigestion** es un sistema integral de gestión de turnos y consultas médicas diseñado para optimizar la administración de centros de salud, clínicas y consultorios médicos. La aplicación facilita tanto la gestión administrativa como la experiencia del paciente a través de una plataforma web moderna y eficiente.

## 🏥 Descripción del Proyecto

Medigestion es una aplicación web completa que permite:

### Para Pacientes:
- **Registro y gestión de perfil personal**: Los pacientes pueden crear y mantener su información personal y médica
- **Solicitud de turnos online**: Sistema intuitivo para reservar citas médicas según disponibilidad
- **Gestión de turnos**: Visualizar, reprogramar o cancelar turnos existentes
- **Historial médico**: Acceso a su historial de consultas y tratamientos
- **Recordatorios automáticos**: Notificaciones por WhatsApp para recordar citas próximas
- **Teleconsulta**: Capacidad de realizar consultas virtuales cuando sea apropiado

### Para Profesionales de la Salud:
- **Agenda digital**: Gestión completa de horarios y disponibilidad
- **Seguimiento de pacientes**: Sistema de monitoreo post-consulta
- **Historial clínico**: Acceso completo al historial médico de sus pacientes
- **Teleconsultas**: Realización de consultas remotas
- **Gestión de turnos**: Aprobación, modificación y cancelación de citas

### Para Administradores:
- **Panel de control**: Dashboard administrativo con estadísticas y métricas
- **Gestión de usuarios**: Administración de pacientes, profesionales y secretarios
- **Configuración de sucursales**: Manejo de múltiples ubicaciones
- **Reportes y analytics**: Generación de informes sobre la actividad del centro
- **Gestión de notificaciones**: Control del sistema de recordatorios y alertas

### Características Técnicas:
- **Integración con WhatsApp**: Sistema automatizado de notificaciones y recordatorios
- **Diseño responsive**: Optimizado para dispositivos móviles y de escritorio
- **Seguridad avanzada**: Autenticación JWT y encriptación de datos sensibles
- **Base de datos robusta**: PostgreSQL para garantizar integridad y performance
- **API RESTful**: Arquitectura escalable y mantenible

El sistema está diseñado para mejorar la eficiencia operativa de los centros médicos, reducir los tiempos de espera, minimizar las ausencias a citas y proporcionar una experiencia superior tanto para pacientes como para profesionales de la salud.

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

## ⚙️ Configuración del Proyecto

### 1. Clonar el Repositorio

```bash
git clone https://github.com/NicoBucarey/TPFinal-MediGestion.git
cd TPFinal-MediGestion
```

### 2. Configuración del Backend

1. Navega a la carpeta del backend:
```bash
cd backend
```

2. Instala las dependencias:
```bash
npm install
```

3. **IMPORTANTE**: Configura las variables de entorno:
   - Crea un archivo `.env` en la carpeta `backend` (copia desde `.env.example`)
   - Configura tus credenciales de PostgreSQL:

```env
PORT=3000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=tu_contraseña_postgres
DB_NAME=medigestion
DB_PORT=5432
JWT_SECRET=murdoc
```

> **Nota para desarrolladores**: Cada desarrollador debe tener su propio archivo `.env` con sus credenciales locales. Este archivo está en `.gitignore` y NO se subirá a git.

4. Crea la base de datos en PostgreSQL:
```sql
CREATE DATABASE medigestion;
```

5. Ejecuta los scripts SQL de la carpeta `backend/model/sql/`:
   - Primero: `estructura_bd_medigestion_postgresql.sql`
   - Luego (opcional): `datos_prueba_turnos.sql`

6. Inicia el servidor:
```bash
node server.js
```

El backend estará corriendo en `http://localhost:3000`

### 3. Configuración del Frontend

1. Navega a la carpeta del frontend:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. **IMPORTANTE**: Configura la URL de la API:
   - Crea un archivo `.env` en la carpeta `frontend` (copia desde `.env.example`)
   - Ajusta el puerto según tu configuración:

```env
VITE_API_URL=http://localhost:3000/api
```

> **Nota**: Si tu compañero usa otro puerto (ej: 3001), solo debe cambiar este valor en su `.env` local.

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

El frontend estará corriendo en `http://localhost:5173` (o el siguiente puerto disponible)

## 👥 Trabajo en Equipo

### Archivos que NO se suben a Git:
- `backend/.env` - Configuración de base de datos local
- `frontend/.env` - URL de la API local
- `node_modules/` - Dependencias

### Archivos de ejemplo (SÍ están en Git):
- `backend/.env.example` - Plantilla de configuración del backend
- `frontend/.env.example` - Plantilla de configuración del frontend

**Cada desarrollador debe crear sus propios archivos `.env` basándose en los `.example`**

## 🔐 Usuario Administrador por Defecto

Al iniciar el backend por primera vez, se crea automáticamente un usuario administrador:

- **Email**: admin@medigestion.com
- **Contraseña**: Admin123!

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Zustand (State Management)
- Heroicons

### Backend
- Node.js
- Express
- PostgreSQL
- JWT para autenticación
- bcrypt para encriptación de contraseñas
- pg (node-postgres)

## 📁 Estructura del Proyecto

```
TPFinal-MediGestion/
├── backend/
│   ├── controllers/     # Lógica de negocio
│   ├── middleware/      # Middlewares de autenticación
│   ├── model/          # Modelos y SQL
│   ├── routes/         # Rutas de la API
│   ├── utils/          # Utilidades
│   ├── .env.example    # Plantilla de variables de entorno
│   └── server.js       # Punto de entrada
├── frontend/
│   ├── src/
│   │   ├── components/ # Componentes reutilizables
│   │   ├── pages/      # Páginas de la aplicación
│   │   ├── hooks/      # Custom hooks
│   │   ├── stores/     # Estado global (Zustand)
│   │   ├── layouts/    # Layouts
│   │   └── config/     # Configuración
│   ├── .env.example    # Plantilla de variables de entorno
│   └── vite.config.js
└── README.md
```

## 🚀 Scripts Útiles

### Backend
```bash
node server.js          # Iniciar servidor
```

### Frontend
```bash
npm run dev            # Servidor de desarrollo
npm run build          # Build de producción
npm run preview        # Preview del build
```

## 📝 Notas Adicionales

- Asegúrate de que PostgreSQL esté corriendo antes de iniciar el backend
- El frontend debe iniciarse después del backend para la correcta conexión
- Los puertos pueden variar según disponibilidad en tu máquina