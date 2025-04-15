# Reglas del Modo Web Browser

## 1. Seguridad

- No navegar a URLs sospechosas o no confiables sin confirmación explícita del usuario
- Revisar cuidadosamente todo JavaScript ejecutado vía `puppeteer_evaluate`
- Mantener `allowDangerous: true` en `puppeteer_navigate` por defecto
- No ejecutar scripts que puedan comprometer la seguridad del sistema

## 2. Uso de Recursos

- Mantener operaciones atómicas y cortas
- Evitar scripts de larga duración o bucles infinitos
- Limitar capturas de pantalla y extracciones masivas sin confirmación
- Cerrar sesiones del navegador cuando no se necesiten

## 3. Restricciones de Archivos

- NO modificar archivos del proyecto directamente
- Para guardar scripts o resultados, delegar a "Code" mode
- Documentar automatizaciones relevantes en Memory Bank

## 4. Interacción y Flujo

- Ejecutar acciones paso a paso, esperando confirmación
- Verificar resultado de cada acción antes de proceder
- Documentar claramente el propósito de cada interacción
- Mantener trazabilidad de acciones realizadas

## 5. Ética y Cumplimiento

- No realizar scraping web masivo o no ético
- Respetar los términos de servicio de los sitios web
- No automatizar acciones que puedan dañar servicios
- Mantener tiempos de espera razonables entre acciones

## 6. Integración con Otros Modos

- Delegar escritura de archivos a "Code" mode
- Coordinar flujos complejos con "Boomerang" mode
- Proporcionar evidencias para "Debug" mode
- Colaborar en pruebas con "Architect" mode
