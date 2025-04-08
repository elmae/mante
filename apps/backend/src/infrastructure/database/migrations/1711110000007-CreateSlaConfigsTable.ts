import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSlaConfigsTable1711110000007 implements MigrationInterface {
  name = 'CreateSlaConfigsTable1711110000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type
    await queryRunner.query(`
            CREATE TYPE "public"."sla_maintenance_type_enum" AS ENUM (
                'first_line',
                'second_line',
                'visit'
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "sla_configs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "zone_id" uuid NOT NULL,
                "client_id" uuid,
                "maintenance_type" "public"."sla_maintenance_type_enum" NOT NULL,
                "response_time" interval NOT NULL,
                "resolution_time" interval NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" uuid,
                "updated_by" uuid,
                CONSTRAINT "pk_sla_configs" PRIMARY KEY ("id"),
                CONSTRAINT "uq_sla_zone_client_type" UNIQUE ("zone_id", "client_id", "maintenance_type"),
                CONSTRAINT "ck_sla_times" CHECK (
                    response_time > '0 seconds'::interval AND
                    resolution_time > response_time
                )
            )
        `);

    // Add foreign key constraints
    await queryRunner.query(`
            ALTER TABLE "sla_configs"
            ADD CONSTRAINT "fk_sla_configs_zone"
            FOREIGN KEY ("zone_id")
            REFERENCES "geographic_zones"("id")
            ON DELETE RESTRICT
            ON UPDATE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "sla_configs"
            ADD CONSTRAINT "fk_sla_configs_client"
            FOREIGN KEY ("client_id")
            REFERENCES "clients"("id")
            ON DELETE SET NULL
            ON UPDATE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "sla_configs"
            ADD CONSTRAINT "fk_sla_configs_created_by"
            FOREIGN KEY ("created_by")
            REFERENCES "users"("id")
            ON DELETE SET NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "sla_configs"
            ADD CONSTRAINT "fk_sla_configs_updated_by"
            FOREIGN KEY ("updated_by")
            REFERENCES "users"("id")
            ON DELETE SET NULL
        `);

    // Create indexes
    await queryRunner.query(`
            CREATE INDEX "ix_sla_configs_zone_id" ON "sla_configs"("zone_id");
            CREATE INDEX "ix_sla_configs_client_id" ON "sla_configs"("client_id");
            CREATE INDEX "ix_sla_configs_maintenance_type" ON "sla_configs"("maintenance_type");
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_sla_configs_maintenance_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_sla_configs_client_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_sla_configs_zone_id"`);

    // Drop foreign keys
    await queryRunner.query(
      `ALTER TABLE "sla_configs" DROP CONSTRAINT "fk_sla_configs_updated_by"`
    );
    await queryRunner.query(
      `ALTER TABLE "sla_configs" DROP CONSTRAINT "fk_sla_configs_created_by"`
    );
    await queryRunner.query(`ALTER TABLE "sla_configs" DROP CONSTRAINT "fk_sla_configs_client"`);
    await queryRunner.query(`ALTER TABLE "sla_configs" DROP CONSTRAINT "fk_sla_configs_zone"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "sla_configs"`);

    // Drop enum type
    await queryRunner.query(`DROP TYPE "public"."sla_maintenance_type_enum"`);
  }
}
