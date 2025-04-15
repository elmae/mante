# Diseño del Modo "web-web-browser" para Roo

## 1. Propósito y Alcance

El modo "web-web-browser" está diseñado para especializarse en la automatización y control de un navegador web headless (o visible, según configuración). Su propósito principal es permitir a Roo interactuar con sitios web, realizar acciones como clics, rellenar formularios, navegar entre páginas, extraer información específica y tomar capturas de pantalla.

**Alcance:**

- Automatización de tareas repetitivas en la web (ej. login, envío de formularios).
- Extracción de datos estructurados de páginas web.
- Realización de pruebas básicas de interfaz de usuario (smoke tests, E2E simples).
- Verificación de la renderización de páginas o componentes específicos.
- Navegación guiada para diagnóstico o demostración.

**Fuera de Alcance:**

- Navegación web general sin un objetivo definido.
- Scraping web masivo o no ético.
- Pruebas de carga o rendimiento complejas.
- Interacción con extensiones del navegador complejas.
- Edición directa de código fuente del proyecto (debe delegarse a "Code" mode).

## 2. Capacidades Específicas

Este modo aprovechará las herramientas proporcionadas por el servidor MCP `puppeteer` (o similar) para realizar las siguientes acciones:

- **Navegación:** Abrir URLs (`puppeteer_navigate`).
- **Interacción con Elementos:**
  - Hacer clic en elementos (`puppeteer_click`).
  - Rellenar campos de formulario (`puppeteer_fill`).
  - Seleccionar opciones en elementos `<select>` (`puppeteer_select`).
  - Simular hover sobre elementos (`puppeteer_hover`).
- **Captura de Información:**
  - Tomar capturas de pantalla de la página completa o de elementos específicos (`puppeteer_screenshot`).
  - Ejecutar scripts JavaScript en el contexto de la página para extraer datos o manipular el DOM (`puppeteer_evaluate`).
- **Gestión del Navegador:**
  - Configurar opciones básicas de lanzamiento (ej. headless, viewport) a través de `puppeteer_navigate`.
  - Acceder a logs de la consola del navegador (via `access_mcp_resource console://logs`).

## 3. Restricciones y Reglas

- **Seguridad:**
  - Se debe evitar la navegación a URLs sospechosas o no confiables si no es explícitamente requerido y confirmado por el usuario.
  - La ejecución de JavaScript (`puppeteer_evaluate`) debe ser cuidadosamente revisada para evitar scripts maliciosos o que comprometan la seguridad. El parámetro `allowDangerous` en `puppeteer_navigate` debe permanecer `false` por defecto.
- **Uso de Recursos:**
  - Las operaciones deben ser atómicas y relativamente cortas. Evitar scripts de larga duración o bucles infinitos dentro de `puppeteer_evaluate`.
  - Limitar la cantidad de capturas de pantalla o extracciones masivas de datos en una sola sesión sin confirmación.
- **Edición de Archivos:** Este modo **no** tendrá permisos para modificar archivos del proyecto directamente. Si se necesita guardar scripts de automatización o resultados, se debe delegar la escritura a "Code" mode o documentarlo en el Memory Bank si aplica.
- **Interacción:** Cada acción en el navegador (navegar, clic, etc.) debe ser un paso discreto, esperando confirmación o resultado antes de proceder al siguiente, a menos que se defina un flujo específico aprobado por el usuario.

## 4. Patrones de Interacción con el Navegador

Las interacciones seguirán generalmente estos patrones:

1.  **Navegación Inicial:**
    - `<use_mcp_tool server_name="puppeteer" tool_name="puppeteer_navigate" arguments='{"url": "..."}'>`
2.  **Localización e Interacción:**
    - Identificar el selector CSS o XPath del elemento objetivo.
    - Usar `<use_mcp_tool server_name="puppeteer" tool_name="puppeteer_click/puppeteer_fill/..." arguments='{"selector": "..."}'>`
    - Esperar a que la página se actualice o aparezca el resultado esperado (puede requerir `puppeteer_evaluate` para verificar cambios en el DOM o esperar un tiempo fijo/evento).
3.  **Extracción de Datos:**
    - Navegar a la página deseada.
    - Usar `<use_mcp_tool server_name="puppeteer" tool_name="puppeteer_evaluate" arguments='{"script": "..."}'>` para ejecutar JS que seleccione y devuelva los datos.
    - Procesar el resultado devuelto por la herramienta.
4.  **Captura de Evidencia:**
    - Navegar o llegar al estado deseado.
    - Usar `<use_mcp_tool server_name="puppeteer" tool_name="puppeteer_screenshot" arguments='{"name": "...", "selector": "..." (opcional)}'>`

## 5. Integración con Otros Modos

- **Architect Mode:** Puede diseñar flujos de automatización o pruebas que luego "web-browser" mode ejecutará. "web-browser" mode puede proporcionar resultados (capturas, datos extraídos) a "Architect" para análisis o documentación.
- **Code Mode:** Puede recibir datos extraídos por "web-browser" mode para procesarlos, guardarlos en archivos o bases de datos. Puede solicitar a "web-browser" mode que verifique la interfaz de usuario después de un cambio en el frontend.
- **Debug Mode:** Puede usar "web-browser" mode para reproducir pasos que llevaron a un error de interfaz de usuario, tomando capturas o logs en el proceso.
- **Boomerang Mode:** Orquestará tareas complejas que involucren interacción web, delegando los pasos específicos de navegador a "web-browser" mode.

Este diseño establece una base para un modo especializado en interacción web, manteniendo la separación de responsabilidades y la seguridad.
