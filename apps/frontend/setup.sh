#!/bin/bash

echo "🚀 Iniciando setup del proyecto frontend..."

# Limpiar instalación existente
echo "🧹 Limpiando instalación existente..."
rm -rf node_modules
rm -rf .next
npm run clean 2>/dev/null || true

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install --legacy-peer-deps

# Verificar versiones
echo "✅ Verificando versiones instaladas..."
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "ESLint version: $(npx eslint --version)"
echo "Jest version: $(npx jest --version)"

# Verificar configuración
echo "🔍 Verificando configuración de ESLint..."
if [ -f ".eslintrc.json" ]; then
    echo "✓ Archivo .eslintrc.json encontrado"
else
    echo "✗ Archivo .eslintrc.json no encontrado"
    exit 1
fi

if [ -f "next.config.js" ]; then
    echo "✓ Archivo next.config.js encontrado"
else
    echo "✗ Archivo next.config.js no encontrado"
    exit 1
fi

# Ejecutar ESLint
echo "🔎 Ejecutando ESLint..."
npm run lint || true

echo "✨ Setup completado."

# Mostrar siguiente paso
echo "
📝 Próximos pasos:

1. Verificar linting:
   npm run lint         # corrección automática
   npm run lint:strict  # verificación estricta

2. Ejecutar tests:
   npm test            # ejecutar tests
   npm run test:watch  # modo watch
   npm run test:coverage # reporte de cobertura

3. Iniciar desarrollo:
   npm run dev         # iniciar servidor de desarrollo
"