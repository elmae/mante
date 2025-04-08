import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMaintenanceRecordsTable1711110000005 implements MigrationInterface {
  name = 'CreateMaintenanceRecordsTable1711110000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type
    await queryRunner.query(`
            CREATE TYPE "public"."maintenance_type_enum" AS ENUM (
                'first_line',
                'second_line',
                'visit'
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "maintenance_records" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "ticket_id" uuid NOT NULL,
                "atm_id" uuid NOT NULL,
                "technician_id" uuid NOT NULL,
                "type" "public"."maintenance_type_enum" NOT NULL,
                "diagnosis" text,
                "work_performed" text NOT NULL,
                "parts_used" jsonb,
                "start_time" TIMESTAMP NOT NULL,
                "end_time" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" uuid,
                "updated_by" uuid,
                CONSTRAINT "pk_maintenance_records" PRIMARY KEY ("id"),
                CONSTRAINT "ck_maintenance_records_timestamps" CHECK (
                    end_time IS NULL OR 
                    end_time > start_time
                )
            )
        `);

    // Add foreign key constraints
    await queryRunner.query(`
            ALTER TABLE "maintenance_records"
            ADD CONSTRAINT "fk_maintenance_records_ticket"
            FOREIGN KEY ("ticket_id")
            REFERENCES "tickets"("id")
            ON DELETE RESTRICT
            ON UPDATE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "maintenance_records"
            ADD CONSTRAINT "fk_maintenance_records_atm"
            FOREIGN KEY ("atm_id")
            REFERENCES "atms"("id")
            ON DELETE RESTRICT
            ON UPDATE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "maintenance_records"
            ADD CONSTRAINT "fk_maintenance_records_technician"
            FOREIGN KEY ("technician_id")
            REFERENCES "users"("id")
            ON DELETE RESTRICT
            ON UPDATE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "maintenance_records"
            ADD CONSTRAINT "fk_maintenance_records_created_by"
            FOREIGN KEY ("created_by")
            REFERENCES "users"("id")
            ON DELETE SET NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "maintenance_records"
            ADD CONSTRAINT "fk_maintenance_records_updated_by"
            FOREIGN KEY ("updated_by")
            REFERENCES "users"("id")
            ON DELETE SET NULL
        `);

    // Create indexes
    await queryRunner.query(`
            CREATE INDEX "ix_maintenance_records_ticket_id" ON "maintenance_records"("ticket_id");
            CREATE INDEX "ix_maintenance_records_atm_id" ON "maintenance_records"("atm_id");
            CREATE INDEX "ix_maintenance_records_technician_id" ON "maintenance_records"("technician_id");
            CREATE INDEX "ix_maintenance_records_type" ON "maintenance_records"("type");
            CREATE INDEX "ix_maintenance_records_start_time" ON "maintenance_records"("start_time");
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_maintenance_records_start_time"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_maintenance_records_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_maintenance_records_technician_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_maintenance_records_atm_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_maintenance_records_ticket_id"`);

    // Drop foreign keys
    await queryRunner.query(
      `ALTER TABLE "maintenance_records" DROP CONSTRAINT "fk_maintenance_records_updated_by"`
    );
    await queryRunner.query(
      `ALTER TABLE "maintenance_records" DROP CONSTRAINT "fk_maintenance_records_created_by"`
    );
    await queryRunner.query(
      `ALTER TABLE "maintenance_records" DROP CONSTRAINT "fk_maintenance_records_technician"`
    );
    await queryRunner.query(
      `ALTER TABLE "maintenance_records" DROP CONSTRAINT "fk_maintenance_records_atm"`
    );
    await queryRunner.query(
      `ALTER TABLE "maintenance_records" DROP CONSTRAINT "fk_maintenance_records_ticket"`
    );

    // Drop table
    await queryRunner.query(`DROP TABLE "maintenance_records"`);

    // Drop enum type
    await queryRunner.query(`DROP TYPE "public"."maintenance_type_enum"`);
  }
}
