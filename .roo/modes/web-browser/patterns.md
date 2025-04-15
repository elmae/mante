# Patrones de Interacción del Modo Web Browser

## 1. Navegación Básica

```typescript
// Patrón para navegación simple
<use_mcp_tool>
<server_name>puppeteer</server_name>
<tool_name>puppeteer_navigate</tool_name>
<arguments>
{
  "url": "https://ejemplo.com",
  "launchOptions": {
    "headless": true
  }
}
</arguments>
</use_mcp_tool>
```

## 2. Interacción con Formularios

### Login

```typescript
// 1. Navegar a la página
<use_mcp_tool>
<server_name>puppeteer</server_name>
<tool_name>puppeteer_navigate</tool_name>
<arguments>
{
  "url": "https://ejemplo.com/login"
}
</arguments>
</use_mcp_tool>

// 2. Rellenar campos
<use_mcp_tool>
<server_name>puppeteer</server_name>
<tool_name>puppeteer_fill</tool_name>
<arguments>
{
  "selector": "#username",
  "value": "usuario"
}
</arguments>
</use_mcp_tool>

// 3. Click en submit
<use_mcp_tool>
<server_name>puppeteer</server_name>
<tool_name>puppeteer_click</tool_name>
<arguments>
{
  "selector": "button[type='submit']"
}
</arguments>
</use_mcp_tool>
```

## 3. Extracción de Datos

### Obtener Texto de Elementos

```typescript
<use_mcp_tool>
<server_name>puppeteer</server_name>
<tool_name>puppeteer_evaluate</tool_name>
<arguments>
{
  "script": "Array.from(document.querySelectorAll('.item')).map(el => el.textContent)"
}
</arguments>
</use_mcp_tool>
```

## 4. Captura de Evidencias

### Screenshot de Elemento

```typescript
<use_mcp_tool>
<server_name>puppeteer</server_name>
<tool_name>puppeteer_screenshot</tool_name>
<arguments>
{
  "name": "elemento-error",
  "selector": ".error-message"
}
</arguments>
</use_mcp_tool>
```

## 5. Monitoreo de Consola

### Acceso a Logs

```typescript
<access_mcp_resource>
  <server_name>puppeteer</server_name>
  <uri>console://logs</uri>
</access_mcp_resource>
```

## 6. Flujos Complejos

### Verificación de Estado UI

1. Navegar a la página
2. Esperar elemento específico
3. Capturar estado actual
4. Realizar acción
5. Verificar cambio
6. Documentar resultado

### Extracción de Datos Paginados

1. Navegar a primera página
2. Extraer datos
3. Verificar paginación
4. Navegar siguiente página
5. Repetir hasta completar
6. Consolidar resultados

## 7. Mejores Prácticas

1. **Validación**

   - Verificar existencia de elementos antes de interactuar
   - Comprobar resultados después de cada acción
   - Manejar casos de error

2. **Esperas**

   - Usar selectores específicos
   - Implementar tiempos de espera razonables
   - Verificar estado de carga

3. **Documentación**

   - Capturar evidencias clave
   - Registrar errores encontrados
   - Documentar flujos exitosos

4. **Seguridad**
   - Validar URLs antes de navegar
   - Revisar scripts antes de ejecutar
   - Mantener datos sensibles seguros
