# Medigestion

## Configuración del Proyecto

### Frontend

1. Navega a la carpeta del frontend:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

El frontend debería estar corriendo en http://localhost:5173 (o el siguiente puerto disponible si el 5173 está ocupado)

### Backend

1. Navega a la carpeta del backend:
```bash
cd backend
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
   - Crea un archivo `.env` en la carpeta backend
   - Añade las variables necesarias (ver `.env.example` si existe)

4. Inicia el servidor:
```bash
npm start
```

El backend debería estar corriendo en http://localhost:3000 (o el puerto especificado en las variables de entorno)

## Tecnologías Utilizadas

### Frontend
- React
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Zustand

### Backend
- Node.js
- Express
- PostgreSQL
- JWT para autenticación
- bcrypt para encriptación
- Express Validator