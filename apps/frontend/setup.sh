#!/bin/bash

# Instalar dependencias principales
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install axios
npm install react-leaflet leaflet
npm install react-hook-form @hookform/resolvers/zod zod
npm install @types/leaflet --save-dev

# Agregar estilos de Leaflet al globals.css
echo "
/* Estilos de Leaflet */
@import 'leaflet/dist/leaflet.css';
" >> src/app/globals.css

# Crear carpetas necesarias si no existen
mkdir -p src/components/atms
mkdir -p src/services/api
mkdir -p src/types

echo "Instalación completada. Asegúrate de:"
echo "1. Configurar NEXT_PUBLIC_API_URL en tu .env.local si el backend no está en http://localhost:3000"
echo "2. Iniciar el backend antes de usar el frontend"
echo "3. Ejecutar 'npm run dev' para iniciar el servidor de desarrollo"