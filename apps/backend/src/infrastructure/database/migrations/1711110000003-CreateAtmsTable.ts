import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAtmsTable1711110000003 implements MigrationInterface {
  name = 'CreateAtmsTable1711110000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "atms" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "serial_number" character varying NOT NULL,
                "model" character varying NOT NULL,
                "brand" character varying NOT NULL,
                "location" geometry(POINT, 4326),
                "address" text NOT NULL,
                "technical_specs" jsonb,
                "client_id" uuid NOT NULL,
                "zone_id" uuid NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" uuid,
                "updated_by" uuid,
                CONSTRAINT "pk_atms" PRIMARY KEY ("id"),
                CONSTRAINT "uq_atms_serial_number" UNIQUE ("serial_number")
            )
        `);

    // Add foreign key constraints
    await queryRunner.query(`
            ALTER TABLE "atms"
            ADD CONSTRAINT "fk_atms_client"
            FOREIGN KEY ("client_id")
            REFERENCES "clients"("id")
            ON DELETE RESTRICT
            ON UPDATE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "atms"
            ADD CONSTRAINT "fk_atms_zone"
            FOREIGN KEY ("zone_id")
            REFERENCES "geographic_zones"("id")
            ON DELETE RESTRICT
            ON UPDATE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "atms"
            ADD CONSTRAINT "fk_atms_created_by"
            FOREIGN KEY ("created_by")
            REFERENCES "users"("id")
            ON DELETE SET NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "atms"
            ADD CONSTRAINT "fk_atms_updated_by"
            FOREIGN KEY ("updated_by")
            REFERENCES "users"("id")
            ON DELETE SET NULL
        `);

    // Create indexes
    await queryRunner.query(`
            CREATE INDEX "ix_atms_serial_number" ON "atms"("serial_number");
            CREATE INDEX "ix_atms_client_id" ON "atms"("client_id");
            CREATE INDEX "ix_atms_zone_id" ON "atms"("zone_id");
            CREATE INDEX "ix_atms_location" ON "atms" USING GIST ("location");
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_atms_location"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_atms_zone_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_atms_client_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_atms_serial_number"`);

    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "atms" DROP CONSTRAINT "fk_atms_updated_by"`);
    await queryRunner.query(`ALTER TABLE "atms" DROP CONSTRAINT "fk_atms_created_by"`);
    await queryRunner.query(`ALTER TABLE "atms" DROP CONSTRAINT "fk_atms_zone"`);
    await queryRunner.query(`ALTER TABLE "atms" DROP CONSTRAINT "fk_atms_client"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "atms"`);
  }
}
