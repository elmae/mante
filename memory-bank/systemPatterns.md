# Patrones del Sistema

## Arquitectura NestJS

### Estructura Modular

- **Módulos Principal y de Características**:
  ```typescript
  @Module({
    imports: [
      ConfigModule.forRoot(),
      TypeOrmModule.forRoot(),
      AuthModule,
      AtmsModule,
      UsersModule,
    ],
    controllers: [],
    providers: [],
  })
  export class AppModule {}
  ```

### Controladores

- **Patrón de Enrutamiento y Decoradores**:

  ```typescript
  @Controller("atms")
  export class AtmsController {
    constructor(private readonly atmsService: AtmsService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.OPERATOR)
    async findAll(@Query() query: ListAtmsDto): Promise<AtmDto[]> {
      return this.atmsService.findAll(query);
    }
  }
  ```

### Servicios y Proveedores

- **Inyección de Dependencias**:
  ```typescript
  @Injectable()
  export class AtmsService {
    constructor(
      @InjectRepository(Atm)
      private atmsRepository: Repository<Atm>,
      private configService: ConfigService,
      private readonly logger: Logger
    ) {}
  }
  ```

### DTOs y Validación

- **Class-validator y Transformación**:

  ```typescript
  export class CreateAtmDto {
    @IsString()
    @MinLength(3)
    readonly name: string;

    @IsString()
    @IsLatitude()
    readonly latitude: string;

    @IsString()
    @IsLongitude()
    readonly longitude: string;

    @IsOptional()
    @IsString()
    readonly description?: string;
  }
  ```

### Guards y Autorización

- **Protección de Rutas**:

  ```typescript
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
      const requiredRoles = this.reflector.get<Role[]>(
        "roles",
        context.getHandler()
      );
      const request = context.switchToHttp().getRequest();
      return requiredRoles.some((role) => request.user.roles.includes(role));
    }
  }
  ```

### Interceptors

- **Transformación y Manejo de Respuestas**:
  ```typescript
  @Injectable()
  export class TransformInterceptor<T>
    implements NestInterceptor<T, Response<T>>
  {
    intercept(
      context: ExecutionContext,
      next: CallHandler
    ): Observable<Response<T>> {
      return next.handle().pipe(
        map((data) => ({
          data,
          statusCode: context.switchToHttp().getResponse().statusCode,
          timestamp: new Date().toISOString(),
        }))
      );
    }
  }
  ```

### Manejo de Errores

- **Filtros de Excepción Personalizados**:

  ```typescript
  @Catch(HttpException)
  export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const status = exception.getStatus();
      const error = exception.getResponse();

      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: ctx.getRequest().url,
        error,
      });
    }
  }
  ```

## Métricas y Monitoreo

### Patrón de Cálculo de Métricas

- **Cálculo Bajo Demanda**: Las métricas se calculan en el momento de la solicitud para garantizar datos actualizados.
- **Agregación Temporal**: Uso de ventanas de tiempo para cálculos históricos (diario, semanal, mensual).
- **Caché de Resultados**: Los resultados se cachean por un período corto para optimizar rendimiento.

### Patrón de Presentación de Métricas

- **Componentes Responsivos**: Adaptación automática a diferentes tamaños de pantalla.
- **Actualización en Tiempo Real**: Revalidación automática de datos cada 5 minutos.
- **Feedback Inmediato**: Indicadores visuales durante la carga y actualización de datos.

### Patrón de Filtrado

- **Filtros Compuestos**: Combinación de múltiples criterios de filtrado.
- **Persistencia de Filtros**: Guardado de preferencias de filtrado en URL.
- **Validación de Rangos**: Control de rangos de fechas y valores válidos.

## Optimización de Consultas

### Patrón de Consultas Eficientes

- **Índices Específicos**: Optimización de índices para consultas frecuentes.
- **Agregación en Base de Datos**: Uso de funciones de agregación SQL.
- **Paginación y Límites**: Control de volumen de datos retornados.

### Patrón de Caché

- **Caché por Usuario**: Resultados específicos por usuario y contexto.
- **Invalidación Selectiva**: Actualización solo de datos afectados.
- **Tiempo de Vida Variable**: TTL basado en tipo de métrica.

## Patrones de Testing

### Testing de Métricas

- **Mocks de Datos**: Datos de prueba representativos para diferentes escenarios.
- **Snapshots de Gráficos**: Validación visual de componentes de gráficos.
- **Cobertura de Casos Borde**: Testing de casos límite y valores extremos.

### Testing de Integración

- **API Simulada**: Mocking de endpoints para pruebas aisladas.
- **Estados de Carga**: Validación de estados loading y error.
- **Validación de Tipos**: TypeScript para garantizar consistencia de datos.
