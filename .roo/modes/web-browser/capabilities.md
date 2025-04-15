# Capacidades del Modo Web Browser

## 1. Navegación Web

- **Herramienta:** `puppeteer_navigate`
- **Capacidades:**
  - Abrir URLs específicas
  - Configurar opciones de lanzamiento del navegador
  - Establecer tamaño del viewport
  - Controlar modo headless/visible

## 2. Interacción con Elementos

### Clicks y Selecciones

- **Herramienta:** `puppeteer_click`
- **Capacidades:**
  - Hacer clic en elementos vía selector CSS/XPath
  - Simular clicks de usuario
  - Esperar respuesta después del click

### Formularios

- **Herramienta:** `puppeteer_fill`
- **Capacidades:**
  - Rellenar campos de texto
  - Manejar inputs de distintos tipos
  - Simular entrada de usuario

### Selects

- **Herramienta:** `puppeteer_select`
- **Capacidades:**
  - Seleccionar opciones en dropdowns
  - Manejar selects múltiples
  - Validar opciones seleccionadas

### Hover

- **Herramienta:** `puppeteer_hover`
- **Capacidades:**
  - Simular hover sobre elementos
  - Trigger de menús desplegables
  - Interacción con tooltips

## 3. Captura de Información

### Screenshots

- **Herramienta:** `puppeteer_screenshot`
- **Capacidades:**
  - Capturar página completa
  - Capturar elementos específicos
  - Especificar nombre y formato
  - Ajustar dimensiones

### Evaluación JavaScript

- **Herramienta:** `puppeteer_evaluate`
- **Capacidades:**
  - Ejecutar scripts en contexto de página
  - Extraer datos del DOM
  - Manipular elementos
  - Retornar resultados serializables

## 4. Monitoreo

### Logs de Consola

- **Recurso:** `console://logs`
- **Capacidades:**
  - Acceder a logs del navegador
  - Monitorear errores JavaScript
  - Seguir mensajes de consola
  - Detectar problemas de red

## 5. Integración

- Coordinación con otros modos para tareas complejas
- Delegación de escritura de archivos
- Compartir resultados y capturas
- Documentación en Memory Bank

## 6. Limitaciones

- No puede modificar archivos del proyecto
- No realiza scraping masivo
- No ejecuta pruebas de carga
- No modifica extensiones del navegador
- No navega sin objetivo definido
