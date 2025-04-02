import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1711110000000 implements MigrationInterface {
  name = "InitialMigration1711110000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Habilitar extensión uuid-ossp
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Crear tipos enum
    await queryRunner.query(`
            CREATE TYPE "public"."user_role_enum" AS ENUM ('admin', 'operator', 'technician', 'client');
            CREATE TYPE "public"."ticket_type_enum" AS ENUM ('preventive', 'corrective', 'visit');
            CREATE TYPE "public"."ticket_priority_enum" AS ENUM ('low', 'medium', 'high', 'critical');
            CREATE TYPE "public"."ticket_status_enum" AS ENUM ('open', 'assigned', 'in_progress', 'resolved', 'closed');
            CREATE TYPE "public"."maintenance_type_enum" AS ENUM ('first_line', 'second_line', 'visit');
        `);

    // Crear tablas base
    // 1. Roles
    await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" VARCHAR NOT NULL,
                "description" TEXT,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "ux_roles_name" UNIQUE ("name")
            );
        `);

    // 2. Permisos
    await queryRunner.query(`
            CREATE TABLE "permissions" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" VARCHAR NOT NULL,
                "description" TEXT,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "ux_permissions_name" UNIQUE ("name")
            );
        `);

    // 3. Usuarios
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "email" VARCHAR NOT NULL,
                "password_hash" VARCHAR NOT NULL,
                "first_name" VARCHAR NOT NULL,
                "last_name" VARCHAR NOT NULL,
                "phone" VARCHAR,
                "role" "public"."user_role_enum" NOT NULL,
                "is_active" BOOLEAN NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
                "updated_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
                CONSTRAINT "ux_users_email" UNIQUE ("email"),
                CONSTRAINT "ck_users_email_format" CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
                CONSTRAINT "ck_users_phone_format" CHECK (phone IS NULL OR phone ~* '^\+?[0-9]{10,15}$')
            );
        `);

    // 4. Roles Permisos
    await queryRunner.query(`
            CREATE TABLE "roles_permissions" (
                "role_id" UUID NOT NULL REFERENCES "roles"("id") ON DELETE RESTRICT,
                "permission_id" UUID NOT NULL REFERENCES "permissions"("id") ON DELETE RESTRICT,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
                PRIMARY KEY ("role_id", "permission_id")
            );
        `);

    // 5. Zonas Geográficas
    await queryRunner.query(`
            CREATE TABLE "geographic_zones" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" VARCHAR NOT NULL,
                "coordinates" JSONB NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
                "updated_by" UUID REFERENCES "users"("id") ON DELETE SET NULL
            );
            CREATE INDEX "ix_geographic_zones_coordinates_gin" ON "geographic_zones" USING GIN ("coordinates");
        `);

    // 6. Clientes
    await queryRunner.query(`
            CREATE TABLE "clients" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" VARCHAR NOT NULL,
                "email" VARCHAR NOT NULL,
                "phone" VARCHAR,
                "address" TEXT,
                "is_active" BOOLEAN NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
                "updated_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
                CONSTRAINT "ux_clients_email" UNIQUE ("email")
            );
        `);

    // 7. ATMs
    await queryRunner.query(`
            CREATE TABLE "atms" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "serial_number" VARCHAR NOT NULL,
                "model" VARCHAR NOT NULL,
                "brand" VARCHAR NOT NULL,
                "latitude" DECIMAL(10,8) NOT NULL,
                "longitude" DECIMAL(11,8) NOT NULL,
                "address" TEXT NOT NULL,
                "technical_specs" JSONB,
                "client_id" UUID NOT NULL REFERENCES "clients"("id") ON DELETE RESTRICT,
                "zone_id" UUID NOT NULL REFERENCES "geographic_zones"("id") ON DELETE RESTRICT,
                "is_active" BOOLEAN NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
                "updated_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
                CONSTRAINT "ux_atms_serial_number" UNIQUE ("serial_number")
            );
            CREATE INDEX "ix_atms_location" ON "atms" ("latitude", "longitude");
        `);

    // 8. Tickets
    await queryRunner.query(`
            CREATE TABLE "tickets" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "atm_id" UUID NOT NULL REFERENCES "atms"("id") ON DELETE RESTRICT,
                "assigned_to" UUID REFERENCES "users"("id") ON DELETE RESTRICT,
                "type" "public"."ticket_type_enum" NOT NULL,
                "priority" "public"."ticket_priority_enum" NOT NULL,
                "status" "public"."ticket_status_enum" NOT NULL DEFAULT 'open',
                "title" VARCHAR NOT NULL,
                "description" TEXT NOT NULL,
                "due_date" TIMESTAMP,
                "completion_date" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
                "updated_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
                CONSTRAINT "ck_tickets_dates" CHECK (
                    (due_date IS NULL OR due_date > created_at) AND
                    (completion_date IS NULL OR completion_date >= created_at)
                )
            );
            CREATE INDEX "ix_tickets_status" ON "tickets" ("status");
            CREATE INDEX "ix_tickets_assigned_to" ON "tickets" ("assigned_to");
            CREATE INDEX "ix_tickets_atm_id" ON "tickets" ("atm_id");
        `);

    // 9. Registros de Mantenimiento
    await queryRunner.query(`
            CREATE TABLE "maintenance_records" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "ticket_id" UUID NOT NULL REFERENCES "tickets"("id") ON DELETE RESTRICT,
                "atm_id" UUID NOT NULL REFERENCES "atms"("id") ON DELETE RESTRICT,
                "technician_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
                "type" "public"."maintenance_type_enum" NOT NULL,
                "diagnosis" TEXT,
                "work_performed" TEXT NOT NULL,
                "parts_used" JSONB,
                "start_time" TIMESTAMP NOT NULL,
                "end_time" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
                "updated_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
                CONSTRAINT "ck_maintenance_records_timestamps" CHECK (
                    end_time IS NULL OR end_time > start_time
                )
            );
            CREATE INDEX "ix_maintenance_records_ticket_id" ON "maintenance_records" ("ticket_id");
            CREATE INDEX "ix_maintenance_records_technician_id" ON "maintenance_records" ("technician_id");
        `);

    // 10. Adjuntos
    await queryRunner.query(`
            CREATE TABLE "attachments" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "ticket_id" UUID NOT NULL REFERENCES "tickets"("id") ON DELETE RESTRICT,
                "file_name" VARCHAR NOT NULL,
                "file_path" VARCHAR NOT NULL,
                "mime_type" VARCHAR NOT NULL,
                "file_size" BIGINT NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" UUID REFERENCES "users"("id") ON DELETE SET NULL
            );
            CREATE INDEX "ix_attachments_ticket_id" ON "attachments" ("ticket_id");
        `);

    // 11. Configuraciones SLA
    await queryRunner.query(`
            CREATE TABLE "sla_configs" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "zone_id" UUID NOT NULL REFERENCES "geographic_zones"("id") ON DELETE RESTRICT,
                "client_id" UUID REFERENCES "clients"("id") ON DELETE RESTRICT,
                "maintenance_type" "public"."maintenance_type_enum" NOT NULL,
                "response_time" INTERVAL NOT NULL,
                "resolution_time" INTERVAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
                "updated_by" UUID REFERENCES "users"("id") ON DELETE SET NULL
            );
        `);

    // Crear vistas materializadas
    await queryRunner.query(`
            CREATE MATERIALIZED VIEW mv_atm_maintenance_stats AS
            SELECT 
                a.id as atm_id,
                a.serial_number,
                COUNT(t.id) as total_tickets,
                COUNT(CASE WHEN t.status = 'open' THEN 1 END) as open_tickets,
                COUNT(CASE WHEN t.status = 'resolved' THEN 1 END) as resolved_tickets,
                AVG(EXTRACT(EPOCH FROM (mr.end_time - mr.start_time))/3600) as avg_resolution_time_hours
            FROM atms a
            LEFT JOIN tickets t ON t.atm_id = a.id
            LEFT JOIN maintenance_records mr ON mr.ticket_id = t.id
            GROUP BY a.id, a.serial_number;

            CREATE MATERIALIZED VIEW mv_technician_performance AS
            SELECT 
                u.id as technician_id,
                u.first_name,
                u.last_name,
                COUNT(mr.id) as total_maintenances,
                AVG(EXTRACT(EPOCH FROM (mr.end_time - mr.start_time))/3600) as avg_resolution_time_hours,
                COUNT(CASE WHEN t.status = 'resolved' THEN 1 END)::float / NULLIF(COUNT(t.id), 0) as resolution_rate
            FROM users u
            LEFT JOIN maintenance_records mr ON mr.technician_id = u.id
            LEFT JOIN tickets t ON t.id = mr.ticket_id
            WHERE u.role = 'technician'
            GROUP BY u.id, u.first_name, u.last_name;
        `);

    // Crear índices para las vistas materializadas
    await queryRunner.query(`
            CREATE UNIQUE INDEX "ix_atm_maintenance_stats_atm_id" ON mv_atm_maintenance_stats (atm_id);
            CREATE UNIQUE INDEX "ix_technician_performance_technician_id" ON mv_technician_performance (technician_id);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar vistas materializadas
    await queryRunner.query(`
            DROP MATERIALIZED VIEW IF EXISTS mv_technician_performance;
            DROP MATERIALIZED VIEW IF EXISTS mv_atm_maintenance_stats;
        `);

    // Eliminar tablas en orden inverso
    await queryRunner.query(`DROP TABLE IF EXISTS "sla_configs";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "attachments";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "maintenance_records";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tickets";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "atms";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "clients";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "geographic_zones";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles_permissions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permissions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles";`);

    // Eliminar tipos enum
    await queryRunner.query(`
            DROP TYPE IF EXISTS "public"."maintenance_type_enum";
            DROP TYPE IF EXISTS "public"."ticket_status_enum";
            DROP TYPE IF EXISTS "public"."ticket_priority_enum";
            DROP TYPE IF EXISTS "public"."ticket_type_enum";
            DROP TYPE IF EXISTS "public"."user_role_enum";
        `);
  }
}
