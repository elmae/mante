import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1711110000000 implements MigrationInterface {
  name = 'InitialMigration1711110000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create roles table
    await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "pk_roles" PRIMARY KEY ("id"),
                CONSTRAINT "uq_roles_name" UNIQUE ("name")
            )
        `);

    // Create permissions table
    await queryRunner.query(`
            CREATE TABLE "permissions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "pk_permissions" PRIMARY KEY ("id"),
                CONSTRAINT "uq_permissions_name" UNIQUE ("name")
            )
        `);

    // Create roles_permissions table
    await queryRunner.query(`
            CREATE TABLE "roles_permissions" (
                "role_id" uuid NOT NULL,
                "permission_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" uuid,
                CONSTRAINT "pk_roles_permissions" PRIMARY KEY ("role_id", "permission_id")
            )
        `);

    // Create users table
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password_hash" character varying NOT NULL,
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "phone" character varying,
                "role" character varying NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" uuid,
                "updated_by" uuid,
                CONSTRAINT "pk_users" PRIMARY KEY ("id"),
                CONSTRAINT "uq_users_email" UNIQUE ("email"),
                CONSTRAINT "ck_users_email_format" CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
                CONSTRAINT "ck_users_phone_format" CHECK (phone IS NULL OR phone ~* '^\\+?[0-9]{10,15}$')
            )
        `);

    // Add foreign key constraints
    await queryRunner.query(`
            ALTER TABLE "roles_permissions"
            ADD CONSTRAINT "fk_roles_permissions_role"
            FOREIGN KEY ("role_id")
            REFERENCES "roles"("id")
            ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "roles_permissions"
            ADD CONSTRAINT "fk_roles_permissions_permission"
            FOREIGN KEY ("permission_id")
            REFERENCES "permissions"("id")
            ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "fk_users_created_by"
            FOREIGN KEY ("created_by")
            REFERENCES "users"("id")
            ON DELETE SET NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "fk_users_updated_by"
            FOREIGN KEY ("updated_by")
            REFERENCES "users"("id")
            ON DELETE SET NULL
        `);

    // Create indexes
    await queryRunner.query(`
            CREATE INDEX "ix_users_email" ON "users"("email");
            CREATE INDEX "ix_users_role" ON "users"("role");
            CREATE INDEX "ix_permissions_name" ON "permissions"("name");
            CREATE INDEX "ix_roles_name" ON "roles"("name");
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_users_email"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_users_role"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_permissions_name"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_roles_name"`);

    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "fk_users_updated_by"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "fk_users_created_by"`);
    await queryRunner.query(
      `ALTER TABLE "roles_permissions" DROP CONSTRAINT "fk_roles_permissions_permission"`
    );
    await queryRunner.query(
      `ALTER TABLE "roles_permissions" DROP CONSTRAINT "fk_roles_permissions_role"`
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "roles_permissions"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
