import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicketsTable1711110000004 implements MigrationInterface {
  name = 'CreateTicketsTable1711110000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
            CREATE TYPE "public"."ticket_type_enum" AS ENUM (
                'preventive',
                'corrective',
                'visit'
            )
        `);

    await queryRunner.query(`
            CREATE TYPE "public"."ticket_priority_enum" AS ENUM (
                'low',
                'medium',
                'high',
                'critical'
            )
        `);

    await queryRunner.query(`
            CREATE TYPE "public"."ticket_status_enum" AS ENUM (
                'open',
                'assigned',
                'in_progress',
                'resolved',
                'closed'
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "tickets" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "atm_id" uuid NOT NULL,
                "assigned_to" uuid,
                "type" "public"."ticket_type_enum" NOT NULL,
                "priority" "public"."ticket_priority_enum" NOT NULL,
                "status" "public"."ticket_status_enum" NOT NULL DEFAULT 'open',
                "title" character varying NOT NULL,
                "description" text NOT NULL,
                "due_date" TIMESTAMP,
                "completion_date" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" uuid,
                "updated_by" uuid,
                CONSTRAINT "pk_tickets" PRIMARY KEY ("id"),
                CONSTRAINT "ck_tickets_dates" CHECK (
                    due_date IS NULL OR 
                    due_date > created_at
                ),
                CONSTRAINT "ck_tickets_completion" CHECK (
                    completion_date IS NULL OR 
                    (completion_date > created_at AND status = 'closed')
                )
            )
        `);

    // Add foreign key constraints
    await queryRunner.query(`
            ALTER TABLE "tickets"
            ADD CONSTRAINT "fk_tickets_atm"
            FOREIGN KEY ("atm_id")
            REFERENCES "atms"("id")
            ON DELETE RESTRICT
            ON UPDATE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "tickets"
            ADD CONSTRAINT "fk_tickets_assigned_to"
            FOREIGN KEY ("assigned_to")
            REFERENCES "users"("id")
            ON DELETE RESTRICT
            ON UPDATE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "tickets"
            ADD CONSTRAINT "fk_tickets_created_by"
            FOREIGN KEY ("created_by")
            REFERENCES "users"("id")
            ON DELETE SET NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "tickets"
            ADD CONSTRAINT "fk_tickets_updated_by"
            FOREIGN KEY ("updated_by")
            REFERENCES "users"("id")
            ON DELETE SET NULL
        `);

    // Create indexes
    await queryRunner.query(`
            CREATE INDEX "ix_tickets_atm_id" ON "tickets"("atm_id");
            CREATE INDEX "ix_tickets_assigned_to" ON "tickets"("assigned_to");
            CREATE INDEX "ix_tickets_status" ON "tickets"("status");
            CREATE INDEX "ix_tickets_type" ON "tickets"("type");
            CREATE INDEX "ix_tickets_priority" ON "tickets"("priority");
            CREATE INDEX "ix_tickets_due_date" ON "tickets"("due_date");
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_tickets_due_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_tickets_priority"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_tickets_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_tickets_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_tickets_assigned_to"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_tickets_atm_id"`);

    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "fk_tickets_updated_by"`);
    await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "fk_tickets_created_by"`);
    await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "fk_tickets_assigned_to"`);
    await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "fk_tickets_atm"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "tickets"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "public"."ticket_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."ticket_priority_enum"`);
    await queryRunner.query(`DROP TYPE "public"."ticket_type_enum"`);
  }
}
