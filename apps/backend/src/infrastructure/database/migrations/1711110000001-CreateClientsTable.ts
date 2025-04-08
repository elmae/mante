import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClientsTable1711110000001 implements MigrationInterface {
  name = 'CreateClientsTable1711110000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "clients" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "email" character varying NOT NULL,
                "phone" character varying NOT NULL,
                "address" text,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" uuid,
                "updated_by" uuid,
                CONSTRAINT "pk_clients" PRIMARY KEY ("id"),
                CONSTRAINT "uq_clients_email" UNIQUE ("email"),
                CONSTRAINT "ck_clients_email_format" CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
                CONSTRAINT "ck_clients_phone_format" CHECK (phone ~* '^\\+?[0-9]{10,15}$')
            )
        `);

    // Add foreign key constraints
    await queryRunner.query(`
            ALTER TABLE "clients"
            ADD CONSTRAINT "fk_clients_created_by"
            FOREIGN KEY ("created_by")
            REFERENCES "users"("id")
            ON DELETE SET NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "clients"
            ADD CONSTRAINT "fk_clients_updated_by"
            FOREIGN KEY ("updated_by")
            REFERENCES "users"("id")
            ON DELETE SET NULL
        `);

    // Create indexes
    await queryRunner.query(`
            CREATE INDEX "ix_clients_email" ON "clients"("email");
            CREATE INDEX "ix_clients_name" ON "clients"("name");
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_clients_email"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_clients_name"`);

    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "fk_clients_updated_by"`);
    await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "fk_clients_created_by"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "clients"`);
  }
}
