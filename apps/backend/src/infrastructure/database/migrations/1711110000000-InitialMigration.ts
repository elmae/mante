import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1711110000000 implements MigrationInterface {
    name = 'InitialMigration1711110000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable UUID extension
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Create enum types
        await queryRunner.query(`
            CREATE TYPE "public"."role_type_enum" AS ENUM (
                'ADMIN',
                'TECHNICIAN',
                'OPERATOR'
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

        // Create roles table
        await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" "public"."role_type_enum" NOT NULL,
                "description" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "pk_roles" PRIMARY KEY ("id"),
                CONSTRAINT "uq_roles_name" UNIQUE ("name")
            )
        `);

        // Create roles_permissions table
        await queryRunner.query(`
            CREATE TABLE "roles_permissions" (
                "role_id" uuid NOT NULL,
                "permission_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "pk_roles_permissions" PRIMARY KEY ("role_id", "permission_id")
            )
        `);

        // Create users table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "username" character varying NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "full_name" character varying,
                "role_id" uuid NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "last_login" TIMESTAMP,
                "password_changed_at" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "pk_users" PRIMARY KEY ("id"),
                CONSTRAINT "uq_users_username" UNIQUE ("username"),
                CONSTRAINT "uq_users_email" UNIQUE ("email")
            )
        `);

        // Create user_sessions table
        await queryRunner.query(`
            CREATE TABLE "user_sessions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "refresh_token" character varying NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "pk_user_sessions" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "roles_permissions"
            ADD CONSTRAINT "fk_roles_permissions_role"
            FOREIGN KEY ("role_id")
            REFERENCES "roles"("id")
            ON DELETE CASCADE
            ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "roles_permissions"
            ADD CONSTRAINT "fk_roles_permissions_permission"
            FOREIGN KEY ("permission_id")
            REFERENCES "permissions"("id")
            ON DELETE CASCADE
            ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "fk_users_role"
            FOREIGN KEY ("role_id")
            REFERENCES "roles"("id")
            ON DELETE RESTRICT
            ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "user_sessions"
            ADD CONSTRAINT "fk_user_sessions_user"
            FOREIGN KEY ("user_id")
            REFERENCES "users"("id")
            ON DELETE CASCADE
            ON UPDATE CASCADE
        `);

        // Add indexes
        await queryRunner.query(`
            CREATE INDEX "idx_users_username" ON "users"("username");
            CREATE INDEX "idx_users_email" ON "users"("email");
            CREATE INDEX "idx_users_role_id" ON "users"("role_id");
            CREATE INDEX "idx_permissions_name" ON "permissions"("name");
            CREATE INDEX "idx_roles_name" ON "roles"("name");
            CREATE INDEX "idx_user_sessions_user_id" ON "user_sessions"("user_id");
            CREATE INDEX "idx_user_sessions_refresh_token" ON "user_sessions"("refresh_token");
            CREATE INDEX "idx_user_sessions_expires_at" ON "user_sessions"("expires_at");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "idx_user_sessions_expires_at"`);
        await queryRunner.query(`DROP INDEX "idx_user_sessions_refresh_token"`);
        await queryRunner.query(`DROP INDEX "idx_user_sessions_user_id"`);
        await queryRunner.query(`DROP INDEX "idx_roles_name"`);
        await queryRunner.query(`DROP INDEX "idx_permissions_name"`);
        await queryRunner.query(`DROP INDEX "idx_users_role_id"`);
        await queryRunner.query(`DROP INDEX "idx_users_email"`);
        await queryRunner.query(`DROP INDEX "idx_users_username"`);

        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "user_sessions" DROP CONSTRAINT "fk_user_sessions_user"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "fk_users_role"`);
        await queryRunner.query(`ALTER TABLE "roles_permissions" DROP CONSTRAINT "fk_roles_permissions_permission"`);
        await queryRunner.query(`ALTER TABLE "roles_permissions" DROP CONSTRAINT "fk_roles_permissions_role"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "user_sessions"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "roles_permissions"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "permissions"`);

        // Drop enum types
        await queryRunner.query(`DROP TYPE "public"."role_type_enum"`);
    }
}
