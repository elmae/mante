# Diseño del Sistema de Adjuntos

## 1. Introducción

Este documento describe el diseño del sistema de adjuntos para la aplicación. El sistema permitirá a los usuarios adjuntar archivos a tickets y registros de mantenimiento.

## 2. Requisitos

- Permitir a los usuarios adjuntar archivos a tickets y registros de mantenimiento.
- Validar el tamaño y tipo de archivo en el backend.
- Implementar autenticación y autorización en los endpoints de subida y descarga.
- Considerar protección contra ataques de carga maliciosa (virus, malware).
- Soportar almacenamiento en la nube (AWS S3, Google Cloud Storage) en el futuro.
- Configurar el sistema de almacenamiento para diferentes entornos (desarrollo, producción).
- Gestionar errores y logging detallado en el servicio de archivos.
- Implementar una política de retención de archivos basada en el tipo de archivo y el estado del ticket/mantenimiento.
- Documentar y auditar el proceso de eliminación de archivos.
- Proporcionar una papelera de reciclaje para restaurar archivos eliminados accidentalmente durante un período limitado.
- Restringir la capacidad de la papelera de reciclaje para evitar el consumo excesivo de espacio en disco.
- Auditar las acciones realizadas en la papelera de reciclaje (restauración, eliminación permanente).

## 3. Arquitectura

### 3.1. Backend

- **Modelo de Datos**: Tabla `attachments`
  - `id` (UUID, PK)
  - `ticket_id` (FK, nullable) - Relación con tabla `tickets`
  - `maintenance_record_id` (FK, nullable) - Relación con tabla `maintenance_records`
  - `filename` (String) - Nombre del archivo
  - `filepath` (String) - Ruta del archivo en el sistema de archivos
  - `mimetype` (String) - Tipo MIME del archivo
  - `size` (Integer) - Tamaño del archivo en bytes
  - `uploaded_by` (FK, User) - Usuario que subió el archivo
  - `uploaded_at` (Timestamp) - Fecha y hora de subida
- **API Endpoints**:
  - `POST /api/v1/files/upload`: Subir un archivo.
    - Requiere autenticación.
    - Recibe el archivo como `multipart/form-data`.
    - Valida el tamaño y tipo de archivo.
    - Guarda el archivo en el sistema de archivos (directorio `uploads`).
    - Crea un registro en la tabla `attachments`.
    - Retorna información del archivo subido (id, filename, url).
  - `GET /api/v1/files/{fileId}`: Obtener un archivo.
    - Requiere autenticación (o acceso público si es necesario).
    - Busca el archivo en la tabla `attachments`.
    - Retorna el archivo (o un redirect a la URL del archivo).
- **Servicio de Archivos**:
  - Abstraer la lógica de gestión de archivos (subida, descarga, almacenamiento).
  - Utilizar el sistema de archivos local para almacenar los archivos (apps/backend/uploads).
  - Soportar almacenamiento en la nube (AWS S3, Google Cloud Storage) en el futuro.
- **Seguridad**:
  - Validar tamaño y tipo de archivo en el backend.
  - Implementar autenticación y autorización en los endpoints de subida y descarga.
  - Considerar protección contra ataques de carga maliciosa (virus, malware).
- **Política de Retención**:
  - Imágenes de tickets cerrados: 3 meses.
  - Documentos de tickets cerrados: 2 años.
  - Archivos de tickets activos: Indefinidamente.
- **Papelera de Reciclaje**:
  - Los archivos eliminados se moverán a una papelera de reciclaje durante 30 días.
  - La papelera de reciclaje tendrá una capacidad limitada (10% del espacio total de almacenamiento de archivos).
  - Los archivos más antiguos se eliminarán permanentemente de la papelera cuando se alcance el límite de capacidad.
- **Auditoría**:
  - Registrar todas las acciones relacionadas con los archivos, incluyendo la subida, descarga, eliminación y restauración.
  - Registrar las acciones realizadas en la papelera de reciclaje (restauración, eliminación permanente).

### 3.2. Frontend

- **Componente de Subida de Archivos**:
  - Permitir al usuario seleccionar y subir archivos.
  - Mostrar progreso de subida.
  - Previsualización de archivos (si es posible).
  - Validaciones en el cliente (tamaño, tipo).
- **Componente de Lista de Archivos Adjuntos**:
  - Mostrar lista de archivos adjuntos a un ticket o registro de mantenimiento.
  - Permitir descargar archivos.
  - Iconos para diferentes tipos de archivo.
- **Integración en Vistas de Tickets y Mantenimiento**:
  - Añadir sección para adjuntar archivos en el formulario de creación/edición de tickets y registros de mantenimiento.
  - Mostrar lista de adjuntos en la vista detallada de tickets y registros de mantenimiento.
- **Hooks y Servicios**:
  - `useFileUpload`: Hook para gestionar la subida de archivos al backend.
  - `apiService`: Servicio para interactuar con la API de archivos del backend.

## 4. Diagrama de Componentes

```mermaid
graph LR
subgraph Frontend
    A[Componente Subida de Archivos] --> B(useFileUpload Hook)
    B --> C(apiService)
    D[Vista Ticket/Mantenimiento] --> A
    D --> E[Componente Lista de Adjuntos]
    E --> C
end
subgraph Backend
    C --> F[API Files Controller]
    F --> G[Files Service]
    G --> H[Sistema de Archivos]
    G --> I[Attachments Repository]
    I --> J[Base de Datos (attachments table)]
end
```

## 5. Próximos Pasos

1.  **Backend**:
    - Implementar modelo `Attachment` (Entity, DTO, Migración).
    - Implementar `FilesService` (subida, descarga, gestión de archivos, política de retención, papelera de reciclaje, auditoría).
    - Implementar `AttachmentsRepository` (CRUD para tabla `attachments`).
    - Implementar `FilesController` (endpoints API).
    - Configurar directorio de subidas (apps/backend/uploads).
    - Tests unitarios e integración.
2.  **Frontend**:
    - Crear componente `FileUpload` (subida de archivos).
    - Crear componente `AttachmentList` (lista de adjuntos).
    - Crear hook `useFileUpload`.
    - Actualizar `apiService` para endpoints de archivos.
    - Integrar componentes en vistas de tickets y mantenimiento.
    - Tests unitarios e integración.
