# Diseño de Interfaces de Usuario - Sistema CMMS

## Sistema de Diseño

### Paleta de Colores

```css
/* Sistema de Colores (HSL) */
--primary: 220 13% 25%;
--primary-foreground: 210 40% 98%;

/* Colores Secundarios */
--secondary: 30 25% 97%;
--secondary-foreground: 222.2 47.4% 11.2%;

/* Colores de Estado */
--success: 142 76% 36%;
--warning: 35 92% 51%;
--destructive: 0 84.2% 60.2%;
--info: 220 14% 96%;

/* Colores del Sistema */
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;

/* Colores de Superficie */
--card: 0 0% 100%;
--card-foreground: 222.2 84% 4.9%;
--popover: 0 0% 100%;
--popover-foreground: 222.2 84% 4.9%;

/* Utilidades */
--border: 220 13% 91%;
--input: 214.3 31.8% 91.4%;
--ring: 220 13% 25%;
--radius: 0.5rem;
```

### Tipografía

```css
/* Fuentes del Sistema */
--font-primary: "Inter", sans-serif;
--font-display: "Playfair Display", serif;

/* Jerarquía Tipográfica */
h1,
.h1 {
  font-family: var(--font-display);
  font-size: 3rem;
  line-height: 1.2;
}
h2,
.h2 {
  font-family: var(--font-display);
  font-size: 2.25rem;
  line-height: 1.3;
}
h3,
.h3 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  line-height: 1.4;
}

/* Tamaños de Texto Base */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
```

### Espaciado

```css
/* Espaciado Base */
--spacing-xs: 0.25rem; /* 4px */
--spacing-sm: 0.5rem; /* 8px */
--spacing-base: 1rem; /* 16px */
--spacing-lg: 1.5rem; /* 24px */
--spacing-xl: 2rem; /* 32px */
--spacing-2xl: 3rem; /* 48px */
```

### Sombras

```css
/* Sombras */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
```

### Bordes

```css
/* Bordes */
--border-radius-sm: 0.25rem;
--border-radius-base: 0.375rem;
--border-radius-lg: 0.5rem;
--border-radius-full: 9999px;
```

## Componentes Base

### Botones

```typescript
interface ButtonProps {
  variant: "primary" | "secondary" | "outline" | "ghost";
  size: "sm" | "base" | "lg";
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}
```

```jsx
// Ejemplos de Botones
<Button variant="primary">Acción Principal</Button>
<Button variant="secondary">Acción Secundaria</Button>
<Button variant="outline">Acción Alternativa</Button>
<Button variant="ghost">Acción Sutil</Button>
```

### Inputs

```typescript
interface InputProps {
  type: "text" | "email" | "password" | "number";
  size: "sm" | "base" | "lg";
  state?: "error" | "success";
  isDisabled?: boolean;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
}
```

```jsx
// Ejemplos de Inputs
<Input type="text" placeholder="Texto normal" />
<Input type="text" state="error" errorMessage="Error en el campo" />
<Input type="text" state="success" />
```

### Cards

```typescript
interface CardProps {
  variant: "default" | "elevated" | "bordered";
  padding?: "none" | "sm" | "base" | "lg";
  isHoverable?: boolean;
}
```

```jsx
// Ejemplos de Cards
<Card variant="default">Contenido básico</Card>
<Card variant="elevated">Contenido destacado</Card>
<Card variant="bordered">Contenido enmarcado</Card>
```

## Mockups de Interfaces Principales

### Dashboard Principal

```mermaid
graph TB
    subgraph Dashboard
        Header["Header (Logo + Nav + User)"]

        subgraph Stats["Estadísticas Generales"]
            TicketsOpen["Tickets Abiertos"]
            TechsActive["Técnicos Activos"]
            SLAStatus["Estado SLA"]
            MTTRStats["MTTR Promedio"]
        end

        subgraph Tables["Tablas Principales"]
            RecentTickets["Tickets Recientes"]
            PendingMaint["Mantenimientos Pendientes"]
        end

        subgraph Maps["Visualización"]
            ATMMap["Mapa de ATMs"]
            TechLocation["Ubicación Técnicos"]
        end
    end
```

### Gestión de Tickets

```mermaid
graph TB
    subgraph TicketManagement["Gestión de Tickets"]
        FilterBar["Barra de Filtros + Búsqueda"]

        subgraph TicketList["Lista de Tickets"]
            TicketItem["Ticket Item"]
            Status["Estado + Prioridad"]
            Details["Detalles + Acciones"]
        end

        subgraph Sidebar["Panel Lateral"]
            TicketDetails["Detalles del Ticket"]
            Timeline["Línea de Tiempo"]
            Actions["Acciones Disponibles"]
        end
    end
```

### App Móvil para Técnicos

```mermaid
graph TB
    subgraph MobileApp["App Móvil"]
        BottomNav["Navegación Inferior"]

        subgraph Screens["Pantallas Principales"]
            TicketList["Lista de Tickets"]
            ATMDetails["Detalles de ATM"]
            MaintenanceForm["Formulario Mantenimiento"]
            Profile["Perfil y Config"]
        end

        subgraph OfflineSupport["Soporte Offline"]
            LocalStorage["Almacenamiento Local"]
            SyncStatus["Estado Sincronización"]
        end
    end
```

## Patrones de UX

### Navegación

1. Estructura Jerárquica

   - Dashboard como punto de entrada
   - Navegación principal en sidebar
   - Breadcrumbs para navegación profunda
   - Tabs para contenido relacionado

2. Acciones Principales
   - Botones prominentes para acciones principales
   - FAB para acciones contextuales
   - Menús desplegables para acciones secundarias

### Feedback al Usuario

1. Estados de Carga

   - Skeletons para carga inicial
   - Spinners para acciones
   - Progress bars para procesos largos

2. Notificaciones

   - Toasts para mensajes temporales
   - Banners para mensajes importantes
   - Modales para confirmaciones

3. Estados Vacíos
   - Ilustraciones informativas
   - Mensajes claros
   - Acciones sugeridas

### Formularios

1. Validación

   - Validación en tiempo real
   - Mensajes de error claros
   - Indicadores visuales de estado

2. Organización
   - Agrupación lógica de campos
   - Progressive disclosure
   - Stepper para procesos largos

### Responsive Design

1. Breakpoints

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
```

2. Layouts
   - Grid system flexible
   - Sidebar colapsable
   - Tablas responsivas
   - Cards adaptables

## Animaciones

```css
/* Transiciones y Efectos */
.transition-soft {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift {
  transition: transform 300ms ease-in-out, box-shadow 300ms ease-in-out;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 300ms ease-in-out;
}

.animate-slide-up {
  animation: slideUp 300ms ease-out;
}
```

## Accesibilidad

1. Contraste y Color

   - Ratios de contraste WCAG 2.1
   - No depender solo del color
   - Modo oscuro soportado

2. Navegación por Teclado

   - Focus visible
   - Orden de tabulación lógico
   - Shortcuts para acciones comunes

3. Semántica
   - HTML semántico
   - ARIA labels donde necesario
   - Jerarquía clara de encabezados

## Optimizaciones de Performance

1. Carga Lazy

   - Imágenes optimizadas
   - Componentes bajo demanda
   - Datos paginados

2. Caché

   - Caché de datos en memoria
   - Almacenamiento local para offline
   - Revalidación inteligente

3. Feedback Instantáneo
   - Optimistic updates
   - Skeleton loading
   - Infinite scroll
