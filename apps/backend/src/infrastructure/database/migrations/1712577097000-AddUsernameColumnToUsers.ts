import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsernameColumnToUsers1712577097000 implements MigrationInterface {
  name = 'AddUsernameColumnToUsers1712577097000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Primero agregamos la columna como nullable para permitir la migración de datos
    await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN "username" VARCHAR
        `);

    // Establecemos el username inicial basado en el email
    await queryRunner.query(`
            UPDATE "users" 
            SET "username" = "email"
        `);

    // Hacemos la columna NOT NULL y agregamos el índice único
    await queryRunner.query(`
            ALTER TABLE "users" 
            ALTER COLUMN "username" SET NOT NULL,
            ADD CONSTRAINT "uq_users_username" UNIQUE ("username")
        `);

    // Agregamos el check constraint para validación básica
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "ck_users_username_format" 
            CHECK (username ~ '^[a-zA-Z0-9@._-]+$')
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminamos las restricciones
    await queryRunner.query(`
            ALTER TABLE "users" 
            DROP CONSTRAINT "ck_users_username_format",
            DROP CONSTRAINT "uq_users_username"
        `);

    // Eliminamos la columna
    await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "username"
        `);
  }
}
